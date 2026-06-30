import type { MDXComponents } from "mdx/types";
import Marginalia from "@/components/shared/Marginalia";
import Callout from "@/components/shared/Callout";
import SectionHeader from "@/components/shared/SectionHeader";
import Highlight from "@/components/shared/Highlight";
import Body from "@/components/shared/Body";
import Kbd from "@/components/shared/Kbd";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Marginalia,
    Callout,
    SectionHeader,
    Highlight,
    Body,
    Kbd,
    ...components,
  };
}
