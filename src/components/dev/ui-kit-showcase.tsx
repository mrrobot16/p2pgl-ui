"use client";

import { Banknote, BookOpen, Building2, CalendarDays, Landmark, Plus, Printer, Settings, Settings2, Share } from "lucide-react";
import { useState, type ReactNode } from "react";

import { AppFrame } from "@/components/layout/app-frame";
import { PageHeader } from "@/components/layout/page-header";
import { SideRail } from "@/components/layout/side-rail";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialogHost, requestConfirmation } from "@/components/ui/confirm-dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { FilterSelect } from "@/components/ui/filter-select";
import { IconButton } from "@/components/ui/icon-button";
import { InputField } from "@/components/ui/input-field";
import { Modal } from "@/components/ui/modal";
import { NumberField } from "@/components/ui/number-field";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select, type SelectOption } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast/toast-context";
import { ToastProvider } from "@/components/ui/toast/toast-provider";
import { Tooltip } from "@/components/ui/tooltip";
import type { AppCategory, RailLink } from "@/lib/navigation/apps";

// Sample navigation for the showcase only: the real rail lists only built pages.
const SAMPLE_LINKS: RailLink[] = [{ identifier: "reports", label: "Reports", href: "/dev/ui-kit/", icon: BookOpen, activePathPrefix: "/dev/reports" }];
const SAMPLE_CATEGORIES: AppCategory[] = [
  {
    identifier: "accounting",
    label: "Accounting",
    railLabel: "Accounting",
    icon: Landmark,
    items: [
      { label: "Bank Transactions", href: "/dev/ui-kit", icon: Banknote },
      { label: "Chart of Accounts", href: "/dev/ui-kit/chart", icon: Building2 }
    ]
  }
];
const SAMPLE_SETTINGS: RailLink = { identifier: "settings", label: "Settings", href: "/dev/ui-kit/settings", icon: Settings2, activePathPrefix: "/dev/settings" };

const SAMPLE_OPTIONS: SelectOption[] = [
  { value: "checking", label: "Checking", rightLabel: "Bank", group: "Assets" },
  { value: "savings", label: "Savings", rightLabel: "Bank", group: "Assets", description: "Money set aside, earning interest." },
  { value: "card", label: "Business card", rightLabel: "Credit Card", group: "Liabilities" },
  { value: "supplies", label: "Office supplies", rightLabel: "Expense", group: "Expenses", keywords: ["paper", "ink"] }
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 border-b border-[var(--color-divider-tertiary)] pb-1 text-lg font-semibold text-[var(--color-text-global)]">{title}</h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function ToastButtons() {
  const { toast } = useToast();
  return (
    <>
      <Button onClick={() => toast({ variant: "success", title: "Transaction posted" })}>Success toast</Button>
      <Button onClick={() => toast({ variant: "error", title: "Could not post this transaction", description: "The node refused the request." })}>
        Error toast
      </Button>
      <Button onClick={() => toast({ variant: "info", title: "Linking a bank needs an admin key" })}>Info toast</Button>
    </>
  );
}

export function UiKitShowcase() {
  const [selectValue, setSelectValue] = useState("");
  const [checkmarkValue, setCheckmarkValue] = useState("checking");
  const [radioValue, setRadioValue] = useState("business");
  const [filterValue, setFilterValue] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmAnswer, setConfirmAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(true);
  const [tableChecked, setTableChecked] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--color-container-background-primary)] p-8 text-[var(--color-text-global)]">
        <div className="mb-8 flex items-center gap-4">
          <h1 className="text-[32px] leading-10">UI kit</h1>
          <ThemeMenu />
        </div>

        <Section title="Shell">
          <div className="flex h-[420px] w-full overflow-hidden rounded border border-[var(--color-divider-tertiary)] bg-[var(--color-container-background-accent)]">
            <SideRail links={SAMPLE_LINKS} categories={SAMPLE_CATEGORIES} settingsLink={SAMPLE_SETTINGS} />
            <div className="min-w-0 flex-1 p-[6px] pl-0">
              <div className="h-full rounded-[var(--radius-x-large)] bg-[var(--color-container-background-primary)]">
                <AppFrame categories={SAMPLE_CATEGORIES}>
                  <PageHeader
                    section="Accounting"
                    title="Bank transactions"
                    actions={
                      <Button variant="primary" iconLeft={Plus}>
                        New
                      </Button>
                    }
                  />
                </AppFrame>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Buttons">
          {(["primary", "secondary", "ghost", "destructive"] as const).map((variant) => (
            <div key={variant} className="flex items-center gap-2">
              {(["sm", "md", "lg"] as const).map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} {size}
                </Button>
              ))}
            </div>
          ))}
          <Button variant="primary" loading>
            Saving
          </Button>
          <Button disabled>Disabled</Button>
          <IconButton icon={Printer} label="Print" />
          <IconButton icon={Share} label="Export" size="sm" />
          <IconButton icon={Settings} label="Settings" variant="outline" />
        </Section>

        <Section title="Fields">
          <div className="w-60">
            <InputField label="Description" placeholder="e.g. Printer Paper & Ink" />
          </div>
          <div className="w-60">
            <InputField label="Company" error="That key isn't accepted for this company." defaultValue="acme" />
          </div>
          <div className="w-60">
            <InputField label="Node URL" hint="Where your gl-node answers." size="lg" placeholder="https://ledger.example.com" />
          </div>
          <div className="w-60">
            <InputField label="Disabled" disabled defaultValue="Can't change" size="sm" />
          </div>
          <div className="w-40">
            <NumberField label="Amount" currency placeholder="0.00" />
          </div>
          <div className="w-72">
            <Textarea label="Memo" rows={3} placeholder={"Office Supplies\nSoftware Subscriptions"} />
          </div>
        </Section>

        <Section title="Choices">
          <div className="w-64">
            <Select label="Category" value={selectValue} onChange={setSelectValue} options={SAMPLE_OPTIONS} placeholder="Select category" allowCustomValue={false} onAddNew={() => undefined} />
          </div>
          <div className="w-56">
            <Select value={checkmarkValue} onChange={setCheckmarkValue} options={SAMPLE_OPTIONS} placeholder="Select" allowCustomValue={false} optionSize="sm" showCheckmark />
          </div>
          <div className="w-60">
            <FilterSelect value={filterValue} onChange={setFilterValue} label="Filter by date" icon={CalendarDays}>
              <option value="all">All dates</option>
              <option value="30d">Last 30 days</option>
            </FilterSelect>
          </div>
          <Checkbox id="kit-checkbox" label="Remember" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
          <Checkbox id="kit-indeterminate" label="Some selected" indeterminate onChange={() => undefined} />
          <RadioGroup
            label="Purpose"
            value={radioValue}
            onChange={setRadioValue}
            options={[
              { value: "business", label: "Business" },
              { value: "personal", label: "Personal", description: "Kept out of the books' reports." }
            ]}
          />
        </Section>

        <Section title="Overlays">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button
            onClick={async () => {
              const confirmed = await requestConfirmation({ title: "Disconnect bank?", message: "Its transactions stop arriving.", confirmLabel: "Disconnect" });
              setConfirmAnswer(confirmed ? "confirmed" : "cancelled");
            }}
          >
            Ask to confirm
          </Button>
          {confirmAnswer ? <span className="text-sm">Answer: {confirmAnswer}</span> : null}
          <DropdownMenu
            trigger={(attributes) => <Button {...attributes}>More actions</Button>}
            items={[
              { label: "Split", onSelect: () => undefined },
              { label: "Exclude", onSelect: () => undefined },
              { label: "Create rule", onSelect: () => undefined, disabled: true }
            ]}
          />
          <Tooltip label="Upload attachment">
            <IconButton icon={Plus} label="Add" />
          </Tooltip>
          <ToastButtons />
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Import accounts" description="One account name per line.">
            <Textarea rows={4} />
            <CardFooter>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Import accounts
              </Button>
            </CardFooter>
          </Modal>
        </Section>

        <Section title="Data">
          <div className="w-[520px]">
            <Table.Root>
              <Table.Head>
                <tr>
                  <Table.HeaderCell>
                    <input type="checkbox" className="qbo-checkbox" aria-label="Select all" checked={tableChecked} onChange={(event) => setTableChecked(event.target.checked)} />
                  </Table.HeaderCell>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell align="right">Balance</Table.HeaderCell>
                </tr>
              </Table.Head>
              <Table.Body>
                <Table.Row selected={tableChecked}>
                  <Table.Cell>
                    <input type="checkbox" className="qbo-checkbox" aria-label="Select Checking" checked={tableChecked} readOnly />
                  </Table.Cell>
                  <Table.Cell>Checking</Table.Cell>
                  <Table.Cell align="right">$12,480.12</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>
                    <input type="checkbox" className="qbo-checkbox" aria-label="Select Savings" disabled />
                  </Table.Cell>
                  <Table.Cell>Savings</Table.Cell>
                  <Table.Cell align="right">$3,000.00</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </div>
          <Card title="Import accounts" description="One account name per line." className="w-80">
            <p className="text-sm">Card body.</p>
          </Card>
          <div className="flex flex-col gap-2">
            {(["neutral", "success", "warning", "danger", "info"] as const).map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </div>
          <div className="flex w-48 flex-col gap-2">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </Section>
      </div>
      <ConfirmDialogHost />
    </ToastProvider>
  );
}
