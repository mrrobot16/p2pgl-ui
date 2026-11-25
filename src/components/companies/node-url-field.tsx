"use client";

import type { FieldSize } from "@/components/ui/field-styles";
import { InputField } from "@/components/ui/input-field";
import { Select, type SelectOption } from "@/components/ui/select";
import { environmentSettings } from "@/lib/environment/current-environment";
import type { DefaultNode } from "@/lib/environment/default-nodes";

type NodeUrlFieldProperties = {
  size: FieldSize;
  value: string;
  onChange: (nodeUrl: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  /** This environment's nodes (ENVIRONMENT_SETTINGS); given only by the UI kit. */
  defaultNodes?: readonly DefaultNode[];
};

const PLACEHOLDER = "https://ledger.example.com";

/** What the field starts with: an address handed in (a `?node=` link, the active company), else the first default node, else nothing. */
export function startingNodeUrl(handedIn: string | undefined, defaultNodes: readonly DefaultNode[] = environmentSettings.defaultNodes): string {
  if (handedIn) return handedIn;
  return defaultNodes[0]?.url ?? "";
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * The node a company is on. With default nodes for this environment, a list
 * to choose from that also takes any typed address; without, a plain address
 * field. Either way the value is the node's address.
 */
export function NodeUrlField({ size, value, onChange, error, disabled, autoFocus, defaultNodes = environmentSettings.defaultNodes }: NodeUrlFieldProperties) {
  const compact = size === "sm";

  if (defaultNodes.length === 0) {
    return (
      <InputField
        label="Node URL"
        size={size}
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder={PLACEHOLDER}
        autoFocus={autoFocus}
        disabled={disabled}
        value={value}
        error={error}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  const options: SelectOption[] = defaultNodes.map((node) => ({ value: node.url, label: node.label, rightLabel: hostOf(node.url), keywords: [node.url] }));
  const chosenNode = defaultNodes.find((node) => node.url === value);
  const hint = compact ? undefined : chosenNode ? `${chosenNode.url}, or type another node's address.` : "Choose a node from the list, or type its address.";

  return (
    <Select
      label="Node URL"
      size={size}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={PLACEHOLDER}
      hint={hint}
      error={error}
      withErrorIcons
      disabled={disabled}
      showCheckmark
      optionSize={compact ? "sm" : "default"}
      emptyMessage={null}
      inputAttributes={{ inputMode: "url", autoComplete: "off", spellCheck: false, autoFocus }}
    />
  );
}
