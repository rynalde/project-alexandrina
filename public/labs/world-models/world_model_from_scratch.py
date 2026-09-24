# A world model from scratch: a tiny JEPA in PyTorch
# World Models (vol. x), chapter 08. Each cell is one step of the chapter.
# Generated from the chapter (lab.mdx) by scripts/build-world-models-lab.mjs: edit the chapter, not this file.

# %% Step 0 — setup
# Needs torch, numpy and matplotlib (all preinstalled on Colab). About 1–2 minutes on a laptop CPU.
import copy, time
import numpy as np
import torch, torch.nn as nn, torch.nn.functional as F
import matplotlib.pyplot as plt

torch.manual_seed(0)
device = "cuda" if torch.cuda.is_available() else "cpu"
print("device:", device)

# %% Step 1 — a tiny world: one ball in a 24×24 box
SIZE, SIGMA, VMAX, KICK = 24, 1.2, 1.5, 0.2   # frame size, ball radius, max speed, kick chance per frame
LO, HI = 1.5, SIZE - 2.5                      # walls
YY, XX = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32)


def render(pos):
    """(n, 2) ball positions -> (n, 24, 24) grayscale frames (a soft dot)."""
    dx = XX - pos[:, 0, None, None]
    dy = YY - pos[:, 1, None, None]
    return np.exp(-(dx**2 + dy**2) / (2 * SIGMA**2)).astype(np.float32)


def step(pos, vel, rng, action=None, kick=KICK):
    """Physics for one frame: maybe a random kick, maybe a push (action), move, bounce off walls."""
    pos, vel = pos.copy(), vel.copy()
    hit = rng.random(len(pos)) < kick
    angle = rng.uniform(0, 2 * np.pi, len(pos))
    speed = np.linalg.norm(vel, axis=1, keepdims=True)
    vel[hit] = (np.stack([np.cos(angle), np.sin(angle)], 1) * speed)[hit]
    if action is not None:
        vel = vel + action
    speed = np.linalg.norm(vel, axis=1, keepdims=True)
    vel = np.where(speed > VMAX, vel / np.maximum(speed, 1e-8) * VMAX, vel)
    pos = pos + vel
    for d in range(2):
        over, under = pos[:, d] > HI, pos[:, d] < LO
        pos[over, d] = 2 * HI - pos[over, d]
        pos[under, d] = 2 * LO - pos[under, d]
        vel[over | under, d] *= -1
    return pos, vel


def random_state(n, rng):
    pos = rng.uniform(LO, HI, (n, 2))
    angle = rng.uniform(0, 2 * np.pi, n)
    vel = np.stack([np.cos(angle), np.sin(angle)], 1) * rng.uniform(0, VMAX, (n, 1))
    return pos, vel


def make_clips(n, length, rng, kick=KICK):
    """n unlabeled videos. The true states come back too, but ONLY to grade the model later."""
    pos, vel = random_state(n, rng)
    frames, states = [], []
    for _ in range(length):
        frames.append(render(pos))
        states.append(np.concatenate([pos, vel], 1))
        pos, vel = step(pos, vel, rng, kick=kick)
    return torch.from_numpy(np.stack(frames, 1)), torch.tensor(np.stack(states, 1), dtype=torch.float32)


rng = np.random.default_rng(0)
sample = render(random_state(4096, rng)[0])
PIX_MEAN, PIX_STD = float(sample.mean()), float(sample.std())   # used to normalize inputs later
clip, _ = make_clips(1, 8, np.random.default_rng(1))       # one example video, just to look at
print("one clip:", tuple(clip.shape), "= (videos, frames, height, width)")
fig, axes = plt.subplots(1, 8, figsize=(12, 1.8))
for t, ax in enumerate(axes):
    ax.imshow(clip[0, t], cmap="gray_r")
    ax.set_title(f"t={t}")
    ax.set_xticks([]); ax.set_yticks([])                      # keep the box border, hide the ticks
plt.savefig("fig1_clip.png", bbox_inches="tight")
plt.show()

# %% Step 2 — the pixel baseline: paint frame t+4
K = 4                                          # how many frames ahead


class PixelPredictor(nn.Module):
    """Two frames in -> the pixels of frame t+K out, trained with squared error."""
    def __init__(self):
        super().__init__()
        self.see = nn.Sequential(nn.Conv2d(2, 32, 4, 2, 1), nn.GELU(), nn.Conv2d(32, 64, 4, 2, 1), nn.GELU(),
                                 nn.Conv2d(64, 64, 4, 2, 1), nn.GELU(), nn.Flatten())
        self.paint = nn.Sequential(nn.Linear(64 * 3 * 3, 512), nn.GELU(), nn.Linear(512, SIZE * SIZE))

    def forward(self, two_frames):
        x = (two_frames - PIX_MEAN) / PIX_STD      # normalize pixels
        return self.paint(self.see(x)).view(-1, SIZE, SIZE)


pix = PixelPredictor().to(device)
opt = torch.optim.AdamW(pix.parameters(), lr=1e-3)
t0 = time.time()
for it in range(1501):
    frames, _ = make_clips(128, 2 + K, rng)
    frames = frames.to(device)
    loss = F.mse_loss(pix(frames[:, :2]), frames[:, 1 + K])
    opt.zero_grad(); loss.backward(); opt.step()
    if it % 500 == 0:
        print(f"step {it:4d}  pixel MSE {loss.item():.4f}")
print(f"trained in {time.time() - t0:.0f}s")

# Grade it on 30 new moments: simulate 2000 possible futures of each one and average them.
rng_eval = np.random.default_rng(1)
stats = []
for trial in range(30):
    pos0, vel0 = random_state(1, rng_eval)
    pos1, vel1 = step(pos0, vel0, rng_eval, kick=0)            # frames t-1 and t
    two = torch.from_numpy(np.stack([render(pos0), render(pos1)], 1)).to(device)
    with torch.no_grad():
        guess = pix(two)[0].cpu().numpy()
    p, v = np.repeat(pos1, 2000, 0), np.repeat(vel1, 2000, 0)
    for _ in range(K):
        p, v = step(p, v, rng_eval)                            # 2000 futures, random kicks included
    average, one_future = render(p).mean(0), render(p[:1])[0]
    stats.append([one_future.max(), average.max(), guess.max(),
                  np.corrcoef(guess.ravel(), average.ravel())[0, 1],
                  np.corrcoef(guess.ravel(), one_future.ravel())[0, 1]])
s = np.mean(stats, 0)
print(f"brightest pixel:  one real future {s[0]:.2f} | average of futures {s[1]:.2f} | network's guess {s[2]:.2f}")
print(f"network's guess looks like:  the average (corr {s[3]:.2f})  more than one real future (corr {s[4]:.2f})")

calm_p, calm_v = pos1, vel1
for _ in range(K):
    calm_p, calm_v = step(calm_p, calm_v, rng_eval, kick=0)   # the future if no kick happens
fig, axes = plt.subplots(1, 3, figsize=(7.5, 2.8))
for ax, img, title in zip(axes, [render(calm_p)[0], average, guess],
                          ["future if\nnothing surprising happens", "average of\n2000 possible futures", "pixel network's\nguess"]):
    ax.imshow(img, cmap="gray_r", vmin=0, vmax=1)
    ax.set_title(title, fontsize=9)
    ax.axis("off")
plt.savefig("fig2_blur.png", bbox_inches="tight")
plt.show()

# %% Step 3 — the JEPA: encoder, predictor, and a slow EMA target encoder
D = 32                                         # size of the representation


class Encoder(nn.Module):
    """One frame (24×24) -> 32 numbers."""
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(1, 16, 4, 2, 1), nn.GELU(),   # 24 -> 12
            nn.Conv2d(16, 32, 4, 2, 1), nn.GELU(),  # 12 -> 6
            nn.Conv2d(32, 32, 4, 2, 1), nn.GELU(),  # 6 -> 3
            nn.Flatten(), nn.Linear(32 * 3 * 3, D))

    def forward(self, frames):                 # (B, 24, 24)
        return self.net(((frames - PIX_MEAN) / PIX_STD).unsqueeze(1))


class Predictor(nn.Module):
    """(z_{t-1}, z_t [, action]) -> guess of z_{t+1}. Two frames of history let it see velocity."""
    def __init__(self, action_dim=0):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(2 * D + action_dim, 256), nn.GELU(),
                                 nn.Linear(256, 256), nn.GELU(), nn.Linear(256, D))

    def forward(self, z_prev, z_now, action=None):
        parts = [z_prev, z_now] + ([action] if action is not None else [])
        return self.net(torch.cat(parts, 1))


def encode(enc, frames):                       # (B, T, 24, 24) -> (B, T, D)
    B, T = frames.shape[:2]
    return enc(frames.reshape(B * T, SIZE, SIZE)).reshape(B, T, D)


def spread(enc, frames):
    """Collapse alarm: how different the representations of different frames are. ~0 = collapsed."""
    with torch.no_grad():
        return F.layer_norm(enc(frames), (D,)).std(0).mean().item()


def train_jepa(mode="ema", steps=1000, batch=128, seed=0, log_every=200):
    """mode: 'ema' (I-JEPA / V-JEPA), 'no_stopgrad' (broken on purpose), 'sigreg' (LeJEPA-style)."""
    torch.manual_seed(seed)
    rng = np.random.default_rng(seed)
    enc, pred = Encoder().to(device), Predictor().to(device)
    target_enc = copy.deepcopy(enc).requires_grad_(False)
    opt = torch.optim.AdamW([*enc.parameters(), *pred.parameters()], lr=1e-3, weight_decay=1e-4)
    watch = make_clips(512, 1, np.random.default_rng(123))[0][:, 0].to(device)
    history = []
    for it in range(steps + 1):
        frames, _ = make_clips(batch, 3, rng)  # frames t-1, t, t+1 (no labels!)
        frames = frames.to(device)
        z = encode(enc, frames)
        if mode == "ema":                      # target from the slow copy, and no gradient through it
            with torch.no_grad():
                target = F.layer_norm(encode(target_enc, frames)[:, 2], (D,))
        elif mode == "no_stopgrad":            # the target is learned by gradient too: cheating is allowed
            target = F.layer_norm(z[:, 2], (D,))
        else:                                  # 'sigreg': same, but a regularizer forbids the cheat
            target = z[:, 2]
        loss = F.mse_loss(pred(z[:, 0], z[:, 1]), target)
        total = (loss + 0.003 * sigreg(z.reshape(-1, D), it)) if mode == "sigreg" else loss
        opt.zero_grad(); total.backward(); opt.step()
        if mode == "ema":
            tau = 0.99 + 0.01 * it / steps     # momentum ramps up: the teacher slows down
            with torch.no_grad():
                for p_t, p_o in zip(target_enc.parameters(), enc.parameters()):
                    p_t.mul_(tau).add_(p_o.detach(), alpha=1 - tau)
        if it % log_every == 0:
            history.append((it, loss.item(), spread(enc, watch)))
            print(f"[{mode}] step {it:4d}  loss {loss.item():.4f}  spread {history[-1][2]:.3f}")
    return enc, pred, history


t0 = time.time()
enc, pred, hist_ema = train_jepa("ema")
print(f"trained in {time.time() - t0:.0f}s")

# %% Step 4 — break it on purpose: no stop-gradient, no EMA
enc_bad, _, hist_bad = train_jepa("no_stopgrad", steps=400, log_every=100)

# %% Step 5 — did it learn physics? Linear probes on the frozen encoder
def probe_r2(enc, seed=7, n_train=4000, n_test=2000):
    """Least-squares probe. Position from z_t; velocity from (z_{t-1}, z_t). R² = 1 perfect, 0 useless."""
    rng = np.random.default_rng(seed)

    def features(n):
        frames, states = make_clips(n, 2, rng)
        with torch.no_grad():
            z = encode(enc, frames.to(device)).cpu()
        return z[:, 1], torch.cat([z[:, 0], z[:, 1]], 1), states[:, 1]

    def fit(x_tr, y_tr, x_te, y_te):
        mu, sd = x_tr.mean(0), x_tr.std(0) + 1e-6
        x_tr = torch.cat([(x_tr - mu) / sd, torch.ones(len(x_tr), 1)], 1)
        x_te = torch.cat([(x_te - mu) / sd, torch.ones(len(x_te), 1)], 1)
        w = torch.linalg.lstsq(x_tr, y_tr).solution
        return (1 - ((x_te @ w - y_te) ** 2).sum() / ((y_te - y_te.mean(0)) ** 2).sum()).item()

    z1, z2, s = features(n_train)
    z1t, z2t, st = features(n_test)
    return fit(z1, s[:, :2], z1t, st[:, :2]), fit(z2, s[:, 2:], z2t, st[:, 2:])


torch.manual_seed(0)
results = {}
for name, model in [("random encoder", Encoder().to(device)), ("JEPA (EMA)", enc), ("collapsed", enc_bad)]:
    results[name] = probe_r2(model)
    print(f"{name:15s} position R² {results[name][0]:5.2f}   velocity R² {results[name][1]:5.2f}")

# %% Step 6 — the 2025 recipe: no EMA, no stop-gradient, SIGReg instead
def sigreg(z, seed, n_dirs=64):
    """SIGReg (LeJEPA, 2025): each random 1-D projection of the batch of embeddings should look like N(0, 1)."""
    g = torch.Generator().manual_seed(seed)
    dirs = torch.randn(z.shape[1], n_dirs, generator=g).to(z.device)
    dirs = dirs / dirs.norm(dim=0, keepdim=True)
    t = torch.linspace(-4, 4, 17, device=z.device)
    gauss = torch.exp(-t**2 / 2)                 # characteristic function of N(0, 1)
    x = (z @ dirs)[:, :, None] * t             # (batch, dirs, t)
    err = (torch.cos(x).mean(0) - gauss) ** 2 + torch.sin(x).mean(0) ** 2
    return torch.trapezoid(err * gauss, t, dim=1).mean() * z.shape[0]


t0 = time.time()
enc_sig, _, hist_sig = train_jepa("sigreg")
results["JEPA (SIGReg)"] = probe_r2(enc_sig)
print(f"trained in {time.time() - t0:.0f}s")
print(f"{'JEPA (SIGReg)':15s} position R² {results['JEPA (SIGReg)'][0]:5.2f}   velocity R² {results['JEPA (SIGReg)'][1]:5.2f}")

fig, ax = plt.subplots(figsize=(6, 3))
for hist, label in [(hist_ema, "EMA + stop-grad"), (hist_bad, "no stop-grad (collapses)"), (hist_sig, "SIGReg")]:
    ax.plot([h[0] for h in hist], [h[2] for h in hist], marker="o", label=label)
ax.set_xlabel("training step"); ax.set_ylabel("spread of representations"); ax.legend(); ax.set_ylim(0, 1.05)
plt.savefig("fig3_spread.png", bbox_inches="tight")
plt.show()

# %% Step 7 — use it: an action-conditioned predictor on the FROZEN encoder
enc.requires_grad_(False)
AMAX = 0.5                                     # strongest push per frame


def latent(frames):
    """Frozen encoder + layer norm, as in V-JEPA 2-AC's planning space."""
    with torch.no_grad():
        return F.layer_norm(enc(frames.to(device)), (D,))


def make_play_data(n, length, rng):
    """A little 'robot data': random pushes, no kicks. This time the actions ARE recorded."""
    pos, vel = random_state(n, rng)
    frames, actions = [], []
    for _ in range(length):
        frames.append(render(pos))
        a = rng.uniform(-AMAX, AMAX, (n, 2))
        actions.append(a)
        pos, vel = step(pos, vel, rng, action=a, kick=0)
    return torch.from_numpy(np.stack(frames, 1)), torch.tensor(np.stack(actions, 1), dtype=torch.float32)


rng = np.random.default_rng(3)
play_frames, play_actions = make_play_data(400, 20, rng)
play_z = latent(play_frames.reshape(-1, SIZE, SIZE)).reshape(400, 20, D)
play_actions = play_actions.to(device)

torch.manual_seed(1)
ac_pred = Predictor(action_dim=2).to(device)
opt = torch.optim.AdamW(ac_pred.parameters(), lr=1e-3)
for it in range(2001):
    i, t = torch.randint(0, 400, (256,)), torch.randint(1, 19, (256,))
    loss = F.mse_loss(ac_pred(play_z[i, t - 1], play_z[i, t], play_actions[i, t]), play_z[i, t + 1])
    opt.zero_grad(); loss.backward(); opt.step()
    if it % 500 == 0:
        print(f"action-conditioned predictor  step {it:4d}  loss {loss.item():.4f}")

# %% Step 8 — plan: imagine, score, act, repeat (Cross-Entropy Method + receding horizon)
@torch.no_grad()
def plan(z_prev, z_now, z_goal, horizon=6, samples=256, elites=32, iters=4):
    mean = torch.zeros(horizon, 2, device=device)
    std = torch.full((horizon, 2), AMAX, device=device)
    for _ in range(iters):
        acts = (mean + std * torch.randn(samples, horizon, 2, device=device)).clamp(-AMAX, AMAX)
        zp, zn = z_prev.expand(samples, -1), z_now.expand(samples, -1)
        energy = torch.zeros(samples, device=device)
        for h in range(horizon):               # imagine: roll the predictor forward, no pixels
            zp, zn = zn, ac_pred(zp, zn, acts[:, h])
            energy += (zn - z_goal).abs().mean(1)   # L1 distance to the goal, in latent space
        best = acts[energy.argsort()[:elites]]
        mean, std = best.mean(0), best.std(0) + 1e-3
    return mean[0].cpu().numpy()               # execute only the first action


def run_episode(rng, subgoal=False, steps=30):
    pos, vel = random_state(1, rng)
    vel[:] = 0
    goal = rng.uniform(LO + 2, HI - 2, (1, 2))
    start_dist = float(np.linalg.norm(pos - goal))
    targets = [(pos + goal) / 2, goal] if subgoal else [goal]   # sub-goal: a picture of the ball halfway
    z_targets = [latent(torch.from_numpy(render(p))) for p in targets]
    prev, path = render(pos), [pos[0].copy()]
    for _ in range(steps):
        frame = render(pos)
        z = latent(torch.from_numpy(np.concatenate([prev, frame])))
        if len(z_targets) > 1 and (z[1:] - z_targets[0]).abs().mean() < 0.3:
            z_targets.pop(0)                   # waypoint reached: head for the real goal
        action = plan(z[:1], z[1:], z_targets[0])[None]
        prev = frame
        pos, vel = step(pos, vel, rng, action=action, kick=0)
        path.append(pos[0].copy())
    return start_dist, float(np.linalg.norm(pos - goal)), np.array(path), targets


t0 = time.time()
torch.manual_seed(0)
success = {}
for use_subgoal in [False, True]:
    r = np.array([run_episode(np.random.default_rng(100 + k), subgoal=use_subgoal)[:2] for k in range(60)])
    near, far = r[r[:, 0] < 9], r[r[:, 0] >= 9]
    success[use_subgoal] = (np.mean(near[:, 1] < 2), np.mean(far[:, 1] < 2))
    print(f"sub-goal={use_subgoal!s:5}  success (ends < 2px from goal):  "
          f"near goals {success[use_subgoal][0]:4.0%} (n={len(near)})   far goals {success[use_subgoal][1]:4.0%} (n={len(far)})")
print(f"planning took {time.time() - t0:.0f}s")

far_k = int(np.argmax(r[:, 0] > 14))                 # first episode whose goal starts > 14px away
fig, axes = plt.subplots(1, 2, figsize=(7, 3.4))
for ax, use_subgoal in zip(axes, [False, True]):
    _, final, path, targets = run_episode(np.random.default_rng(100 + far_k), subgoal=use_subgoal)
    ax.plot(path[:, 0], path[:, 1], "-o", ms=2.5, color="#c7502e")
    ax.plot(*path[0], "o", color="#1a1512", ms=8, label="start")
    ax.plot(*targets[-1][0], "*", color="#5f6f52", ms=16, label="goal")
    if use_subgoal:
        ax.plot(*targets[0][0], "x", color="#1a1512", ms=10, mew=2, label="sub-goal")
    ax.set_xlim(0, SIZE); ax.set_ylim(SIZE, 0); ax.set_aspect("equal")
    ax.set_title(f"{'with' if use_subgoal else 'no'} sub-goal: ends {final:.1f}px away", fontsize=9)
    ax.legend(fontsize=7, loc="lower right")
plt.savefig("fig4_planning.png", bbox_inches="tight")
plt.show()

# Why far goals are hard: how does the latent distance grow with the real distance?
rng = np.random.default_rng(5)
a, b = rng.uniform(LO, HI, (3000, 2)), rng.uniform(LO, HI, (3000, 2))
lat = (latent(torch.from_numpy(render(a))) - latent(torch.from_numpy(render(b)))).abs().mean(1).cpu().numpy()
dist = np.linalg.norm(a - b, axis=1)
for lo, hi in [(0, 3), (3, 6), (6, 9), (9, 12), (12, 16), (16, 24)]:
    m = (dist >= lo) & (dist < hi)
    print(f"real distance {lo:2d}–{hi:2d}px  ->  latent L1 {lat[m].mean():.2f}")

# %% Step 9 — self-check: if one of these fails, something above is broken
assert s[3] > s[4], "the pixel guess should look more like the AVERAGE of futures than like one future"
assert results["JEPA (EMA)"][0] > 0.9 and results["random encoder"][0] < 0.9, "JEPA should beat a random encoder"
assert hist_bad[-1][2] < 0.05 and hist_ema[-1][2] > 0.5, "no-stop-grad should collapse, EMA should not"
assert results["JEPA (SIGReg)"][0] > 0.9, "SIGReg should also learn position"
assert success[False][0] > 0.8 and success[True][1] > success[False][1], "planner: near goals work, a sub-goal rescues far ones"
print("all checks passed ✓")
