"use client";

import { useSyncExternalStore } from "react";

import {
  COMPANY_STORAGE_KEY,
  activeCompany,
  readCompanyState,
  withActiveCompany,
  withCompanyAdded,
  withCompanyForgotten,
  writeCompanyState,
  type CompanyState
} from "@/lib/companies/company-store";
import type { Company } from "@/lib/companies/company";

const CHANGE_EVENT = "openledger:companies-change";

// The snapshot must be the same object while storage is unchanged.
let cachedRaw: string | null | undefined;
let cachedState: CompanyState = { companies: [], activeIdentifier: null };

function snapshot(): CompanyState {
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(COMPANY_STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedState = readCompanyState(window.sessionStorage);
  }
  return cachedState;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function update(change: (state: CompanyState) => CompanyState): void {
  writeCompanyState(window.sessionStorage, change(snapshot()));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Adds (or re-keys) a company and makes it active. */
export function rememberCompany(company: Company): void {
  update((state) => withCompanyAdded(state, company));
}

/** Forgets a company in this tab; the ledger on its node is untouched. */
export function forgetCompany(identifier: string): void {
  update((state) => withCompanyForgotten(state, identifier));
}

/**
 * Makes another company active, then reloads the page: switching is a hard
 * boundary, and a reload guarantees nothing fetched for the previous
 * company survives (the old app's approach).
 */
export function switchCompany(identifier: string): void {
  update((state) => withActiveCompany(state, identifier));
  window.location.reload();
}

/** Forgets every company and key in this tab. */
export function forgetAllCompanies(): void {
  update(() => ({ companies: [], activeIdentifier: null }));
}

export type CompaniesView = {
  /** False during the server render and the first browser render, before storage is read. */
  ready: boolean;
  companies: Company[];
  active: Company | null;
};

const NOT_READY: CompaniesView = { ready: false, companies: [], active: null };
let cachedViewState: CompanyState | null = null;
let cachedView: CompaniesView = NOT_READY;

function viewOf(state: CompanyState): CompaniesView {
  if (state !== cachedViewState) {
    cachedViewState = state;
    cachedView = { ready: true, companies: state.companies, active: activeCompany(state) };
  }
  return cachedView;
}

export function useCompanies(): CompaniesView {
  return useSyncExternalStore(
    subscribe,
    () => viewOf(snapshot()),
    () => NOT_READY
  );
}
