"use client";

import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import { useEffect, useState } from "react";

import { useCompanies } from "@/lib/companies/use-companies";
import { ledgerEndpointUrl, requestGraphql } from "@/lib/gl-node/client";

type LedgerDocument<Result, Variables> = DocumentTypeDecoration<Result, Variables> & { toString(): string };

// `attempt` tells an answer to *Try again* from the failure before it.
type Answer = { key: string; attempt: number; data: unknown; error: unknown; receivedAt: Date | null };

// The last answer to each question, for this page's life. A question is the
// company, the operation and its variables, so one company's answers never
// show under another (and switching companies reloads the page anyway).
const answers = new Map<string, { data: unknown; receivedAt: Date }>();

export type LedgerQueryState<Result> = {
  /** The answer to show: this question's, or while it loads, the last one shown. */
  data: Result | null;
  /** When `data` arrived. */
  receivedAt: Date | null;
  /** Why this question failed, or null. */
  error: unknown;
  /** This question's answer hasn't arrived yet. */
  loading: boolean;
  /** Asks the same question again (after a failure). */
  retry: () => void;
};

/**
 * Asks the active company's ledger one GraphQL question, the screen's one
 * request (the performance skill, section 2). It asks again whenever the
 * screen opens or the variables change, showing the last answer meanwhile;
 * a question no longer wanted (the screen left, a filter changed) is
 * cancelled. Use it only under the company gate, where a company is active.
 */
export function useLedgerQuery<Result, Variables>(document: LedgerDocument<Result, Variables>, variables: Variables): LedgerQueryState<Result> {
  const { active } = useCompanies();
  const variablesKey = JSON.stringify(variables);
  const operation = document.toString();
  const key = active ? `${active.identifier}\n${operation}\n${variablesKey}` : null;
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = () => setAttempt((current) => current + 1);

  useEffect(() => {
    if (!active || key === null) return;
    const controller = new AbortController();
    const endpoint = { url: ledgerEndpointUrl(active.nodeUrl, active.ledgerName), apiKey: active.apiKey };
    requestGraphql(endpoint, document, JSON.parse(variablesKey) as Variables, fetch, controller.signal).then(
      (data) => {
        const receivedAt = new Date();
        answers.set(key, { data, receivedAt });
        setAnswer({ key, attempt, data, error: null, receivedAt });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setAnswer({ key, attempt, data: null, error, receivedAt: null });
      }
    );
    return () => controller.abort();
  }, [active, attempt, document, key, variablesKey]);

  if (answer !== null && answer.key === key && answer.attempt === attempt) {
    if (answer.error === null) return { data: answer.data as Result, receivedAt: answer.receivedAt, error: null, loading: false, retry };
    return { data: null, receivedAt: null, error: answer.error, loading: false, retry };
  }
  const remembered = key === null ? undefined : answers.get(key);
  if (remembered) return { data: remembered.data as Result, receivedAt: remembered.receivedAt, error: null, loading: true, retry };
  const previous = answer !== null && answer.error === null ? answer : null;
  return { data: (previous?.data as Result | undefined) ?? null, receivedAt: previous?.receivedAt ?? null, error: null, loading: true, retry };
}
