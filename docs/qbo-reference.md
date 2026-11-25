# QuickBooks Online reference screenshots

Status: analysis of 2026-11-25.

166 screenshots of QuickBooks Online's web app (April 2026, collected by
Mobbin), in `.do_not_commit_ignore/source-qbo-screenshots/` (not
committed). Each file is named for what it shows, starting with its area
(`reports-…`, `bank-transactions-…`). *No.* is the original number
(`QuickBooks Web Apr 2026 NNN.png`), kept so a file can be traced back to
Mobbin. Of the original 208, 42 repeats of a screen in the same state
were deleted (2026-11-25);
`.do_not_commit_ignore/source-qbo-screenshots.zip` still holds all 208
under their original names.

The company in them is a Singapore one, so the wording is British/Singapore
English: *Supplier* (US *Vendor*), *Customise*, *Cheque*, *Favourites*,
*GST*, dates as DD/MM/YYYY.

**How they're used (maintainer, 2026-11-25):** a reference for structure
and positions: where things sit on each screen, how a screen is put
together, which controls exist. Not the source of truth for colours,
fonts or styling, which stay the old app's. **When the old app and these
screenshots disagree on structure, QuickBooks' structure wins.** Our UX
improvements go on top and are noted in each parity checklist. Never
carried over: QuickBooks' or Intuit's name, logo, brand artwork or
product names.

## Areas at a glance

| Area | Files | Our step |
|---|---|---|
| App shell, home and navigation | `shell-*`, `home-*` | 2 (built), Home later |
| Sign-in and account security | `sign-in-*` | 3 (built); 013 later |
| Reports | `reports-*` | **4, next** |
| Chart of accounts and accounts | `chart-of-accounts-*`, `bank-transactions-edit-account-*`, `bank-transactions-new-account-*` | 5 |
| Bank transactions | `bank-transactions-*` | 6 |
| Bank rules | `bank-rules-*` | later |
| Receipts | `receipts-*` | later (store) |
| Reconcile | `reconcile-*` | later (after 014) |
| Expenses, bills, suppliers | `expenses-*`, `bills-*`, `bill-*`, `pay-bills-*`, `suppliers-*` | later (store) |
| Sales: invoices, credit notes, sales, products | `invoice-*`, `invoices-*`, `credit-note-*`, `sales-*`, `products-and-services-*` | later (store) |
| Customer Hub, customers, leads | `customer-hub-*`, `customers-*`, `leads-*` | later (store) |
| Team: employees | `employees-*` | later (store) |
| Tax (GST) | `tax-*` | not planned |
| Company settings, users, billing | `create-company-form`, `settings-*`, `users-*`, `billing-*` | later |

## App shell, home and navigation

| File | No. | What it shows |
|---|---|---|
| `home-first-use-tasks-panel.png` | 026 | Home on first use: "Good morning" greeting, app chips (Accounting, Expenses & Pay Bills, Sales & Get Paid, Customers, Team, Tax), Business Feed, Create actions, Business at a glance; a right-hand **Tasks** panel with setup tasks and progress |
| `home-dashboard.png` | 086 | Home ("Good afternoon"): Business Feed card, Create actions chips (Create invoice, Record expense, …), Business at a glance widgets (Profit & loss bars, Expenses donut, Add widgets, Bank accounts); a toast at the top of the search bar |
| `home-bookmarks-flyout.png` | 090 | Home with the **Bookmarks** flyout open from the rail (empty, *Bookmark current page*) |
| `home-bookmark-create-popover.png` | 091 | Bookmark creation popover: label field, *Remove* / *Save* |
| `home-bookmarks-flyout-saved.png` | 092 | Bookmarks flyout listing *Home*; toast "Bookmark saved for Home" |
| `home-customise-bookmarks-modal.png` | 093 | *Customise your bookmarks* modal: search, checkbox list of pages (Home, Feed, Standard reports, Custom reports, Management reports, Cash flow overview, Bank transactions, Integration transactions, Receipts), *Cancel* / *Save* |
| `home-widget-period-menu.png` | 096 | Home: Profit & loss widget's period menu (This fiscal quarter … Last fiscal year) |
| `home-add-widgets-panel.png` | 099 | Home with an **Add widgets** side panel: checkbox groups (Operational, Smart suggestions, All widgets), *Cancel* / *Save* |
| `home-dashboard-cash-flow.png` | 100 | Home scrolled: Cash flow area chart (Cash balance / Money in-out toggle), Sales and Accounts receivable widgets |
| `home-dashboard-accounts-receivable.png` | 102 | Home: Accounts receivable donut widget with ageing buckets |
| `home-customise-app-menus-modal.png` | 306 | *Customise your app menus* modal over Home: drag handles to reorder the pinned apps, *Reset to default*, *Cancel* / *Save* |
| `shell-global-search-dropdown.png` | 310 | **Global search** dropdown from the top bar: recent Transactions (type, number, contact, date, amount), Contacts, Ledger accounts, a link to advanced search |
| `shell-advanced-transactions-search.png` | 311 | *Advanced transactions search* page: filters (Date range, Transaction type, Reference number, Contact, Amount), results table (date, type, ref no., contact, due date, balance, amount, memo, last modified) |
| `shell-notifications-panel.png` | 313 | Notifications panel from the top bar (Inbox / Recommended tabs, empty state "All clear") |
| `shell-gear-menu.png` | 314 | Gear menu from the top bar: four columns (Your company, Lists, Tools, Profile); a banner to switch back to the previous experience |
| `shell-avatar-menu.png` | 338 | Avatar menu from the top bar: name, email, *Manage your account*, *Sign out* |

**Shell structure seen across all screens:** a full-width top bar (product
mark, company name, global search field, then icons: create, bookmarks,
notifications, gear, help, avatar); a narrow left rail under it with
*Create*, *Bookmarks*, *Home*, *Feed*, *Reports*, *All apps*, a *Pinned*
group (Accounting, Expenses, Sales) and *Customise* at the bottom; inside
an app, a second sidebar listing every app area as a collapsible tree
(Accounting: Bank transactions, Integration transactions, Receipts,
Reconcile, Rules, Chart of accounts, Recurring transactions, My
accountant; then Expenses & Bills, Sales & Get Paid, Customer Hub, Team,
Tax, Marketing). Toasts appear at the top centre with a *Close* link.

## Sign-in and account security

| File | No. | What it shows |
|---|---|---|
| `sign-in-password.png` | 365 | Sign-in, password step: centred card, the account's email, *Use a different account*, password field with *Show*, *Continue*, *Text a code*, *Forgot password?*; legal footer |
| `sign-in-email-code.png` | 371 | Email verification step: 6-digit code field, *Continue*, *I didn't get an email* |
| `sign-in-update-password.png` | 374 | *It's time to update your password*: new and confirm fields with live rule checks (length, cases, number, symbol), *Update password*, *Skip* |

## Reports

| File | No. | What it shows |
|---|---|---|
| `reports-profit-and-loss-page.png` | 106 | Profit and loss report page: *Back*, title "Profit and loss reports", a one-line tip, the filter bar, then the report card (Compact density) |
| `reports-profit-and-loss-full.png` | 107 | **Profit and Loss, the full layout:** filter bar on top (*Report period*, *From*, *To*, *Accounting method* Cash / Accrual toggle, *Display columns by*, *Compare to*; *Customise*, *Save as*); centred report card with a toolbar (Compact menu, refresh, email, print, export, more), title, company, period; columns *Account* / *Total*; collapsible Income, Gross Profit, Expenses, Net Operating Income, Other Expenses, Net Income; footer "Accrual basis · timestamp" and *Add note*; a *Categorise transactions* button bottom right |
| `reports-save-as-new-report-modal.png` | 108 | *Save as new report?* modal: report name, *Share with others* toggle, *Add to group*, *Cancel* / *Save* |
| `reports-profit-and-loss-two-month-comparison.png` | 110 | P&L comparing two months (current, previous, $ change columns), renamed "… - copy"; toast "saved to custom reports tab" |
| `reports-compact-view-menu.png` | 111 | Compact menu open: *Compact view* / *Normal view*, *Expand all* / *Collapse all* |
| `reports-profit-and-loss-collapsed.png` | 112 | P&L with every section collapsed to its totals |
| `reports-email-report-modal.png` | 115 | *Send Profit and Loss* email modal: To, Cc, Subject, Format (Excel, CSV, PDF), Orientation, Message, File name, *Cancel* / *Send email* |
| `reports-email-sent-toast.png` | 117 | P&L page with toast "Email for report sent successfully" |
| `reports-title-edit-in-place.png` | 118 | Report title being edited in place on the card |
| `reports-custom-title.png` | 119 | Report with a custom title |
| `reports-add-note.png` | 120 | *Add note* open: a text box under the report (4,000 characters) |
| `reports-note-saved.png` | 122 | Note saved, shown under the report above the basis line |
| `reports-profit-and-loss-no-activity.png` | 124 | P&L for Last quarter (October–December), no activity: rows with dashes |
| `reports-compare-to-menu.png` | 125 | **Compare to** menu open: Time periods (Previous year, Previous period, Year-to-date, Previous year-to-date, Custom period) and Calculations (% of Row, % of Column, % of Expense, % of Income), with checkboxes |
| `reports-profit-and-loss-previous-period.png` | 128 | P&L compared with the previous period: two value columns and $ change |
| `reports-save-report-add-group.png` | 129 | Save as new report modal: sharing on, *+ Add new group* |
| `reports-save-report-new-group.png` | 130 | Same: new group name field |
| `reports-standard-reports.png` | 134 | **Reports & Analytics, Standard reports:** left sub-menu (Standard reports, Custom reports, Management reports, Financial planning: Cash flow overview, Cash flow planner); search box; collapsible groups *Favourites*, *Business overview*, *Who owes you*; two columns of report names, each with a favourite star and a more menu |
| `reports-custom-reports.png` | 135 | Custom reports tab: help banner, table (Report name, Created by, Date range, Action), empty |
| `reports-management-reports.png` | 136 | Management reports tab: table (Name, Created by, Last modified, Report period, Action *Preview*), *+ Management report* |
| `reports-management-report-cover-page.png` | 139 | Create management report editor: page thumbnails on the left, cover page form (template, logo, title, subtitle, period, prepared on/by, disclaimer), live preview on the right; *Preview report*, *Save*, *Save and close* |
| `reports-management-report-cover-templates.png` | 140 | Same: cover template picker (Default, Standard, Madison, Atlas) |
| `reports-management-report-preliminary-pages.png` | 144 | Same: preliminary pages, a rich-text editor |
| `reports-management-report-reports-and-charts.png` | 146 | Same: *Reports and charts* page listing the reports included, *Add* |
| `reports-management-report-text-editor.png` | 148 | Rich-text editor, a paragraph selected |
| `reports-management-report-text-colour.png` | 153 | Same, text colour picker |
| `reports-management-report-text-coloured.png` | 154 | Same, heading coloured |

## Chart of accounts and accounts

| File | No. | What it shows |
|---|---|---|
| `chart-of-accounts.png` | 166 | **Chart of accounts:** breadcrumb *< All lists*; title with *Give feedback*, *Run report*, *New account* (split button); toolbar *Batch actions*, *Filter by name or number*, a type filter, edit/print/settings icons, pager; table columns checkbox, Name, Account type, Detail type, Currency, QuickBooks balance, Bank balance, Action (*Account history* or *Run report*, with a menu) |
| `chart-of-accounts-new-account-panel.png` | 178 | *Connect an account* flow with the *New account* side panel: account name, account type and detail type, *Make this a subaccount*, opening balance and *as of* date, currency, description, a balance sheet preview of where the account will sit; *Cancel* / *Save* |
| `bank-transactions-edit-account-panel.png` | 194 | *Edit Account* side panel opened from Bank transactions: name, account type, detail type, subaccount, currency (locked), description, bank connection with *Disconnect*, balance |
| `bank-transactions-new-account-panel.png` | 219 | *New account* side panel from a bank transaction's category picker (empty) |
| `bank-transactions-new-account-panel-filled.png` | 220 | Same, filled (Expenses / Supplies), with a Profit & loss preview of where it will sit |

## Bank transactions

| File | No. | What it shows |
|---|---|---|
| `bank-transactions-posted-tab.png` | 186 | **Bank transactions:** account picker (*Main*), account card (*Bank: $47.40*, posted balance, last update), header *Give feedback*, *Update*, *Requests*, *Link account*; tabs Pending / Posted / Excluded; links *Switch to previous version*, *Tutorial*, *Go to bank register*; Posted tab: Date, Bank description, Spent, Received, From/To, Match/Category, Transaction posted, *Undo* |
| `bank-transactions-excluded-tab.png` | 187 | Excluded tab: Date, Bank description, Amount, *Undo* |
| `bank-transactions-pending-row-expanded.png` | 188 | Pending tab with a row expanded: full bank description, Match / Categorise toggle, transaction type, account, From/To, memo, file upload; *Post*, *Split*, *Create rule*, *Exclude*; *Categorisation history* |
| `bank-transactions-pending-row-filled.png` | 189 | Same, category and supplier chosen |
| `bank-transactions-row-attachment.png` | 191 | Same, a file attached |
| `bank-transactions-posted-toast.png` | 192 | Pending list after posting; toast "Transaction posted" |
| `bank-transactions-edit-account-panel.png` | 194 | Pending list with the account card's menu (edit account sign-in, edit details, disconnect) and the *Edit Account* panel |
| `bank-transactions-new-layout-banner.png` | 198 | The newer banking layout: an AI-features banner, tabs For review / Categorised / Excluded, columns Description, Payee, Category or match, Spent, Received, *Add*; *Try new banking page* |
| `bank-transactions-search-no-results.png` | 199 | Search with no results: "We couldn't find transactions that match your search" |
| `bank-transactions-search-results.png` | 200 | Search with results |
| `bank-transactions-date-filter-calendar.png` | 202 | Date filter: Custom with a calendar |
| `bank-transactions-date-filter-range.png` | 204 | Date filter: From / To fields, *Reset* / *Apply* |
| `bank-transactions-date-filter-applied.png` | 205 | Custom range applied |
| `bank-transactions-type-filter-menu.png` | 206 | Transaction filter menu: All transactions, Money in, Money out, Suggested matches, Transfers, Rules, Missing From/To |
| `bank-transactions-money-in-filter.png` | 207 | *Money in* applied |
| `bank-transactions-columns-panel.png` | 208 | **Columns** panel from the settings icon: drag to reorder, checkboxes (Date, Cheque no., Bank description, Spent, Received, Files, Requests, From/To, Product/Service, Match/Category, Action) |
| `bank-transactions-columns-panel-all-options.png` | 209 | Same panel, scrolled to show every option (through Product/Service, Match/Category, Action), Cheque no. ticked |
| `bank-transactions-cheque-number-column.png` | 211 | Money-in list with a Cheque no. column |
| `bank-transactions-columns-reorder.png` | 212 | Columns being dragged into a new order |
| `bank-transactions-category-picker.png` | 218 | Category picker open on an expanded row: *Suggested* accounts, *All accounts*, *+ Add new account* |
| `bank-transactions-new-account-panel.png` | 219 | *New account* panel from the category picker |
| `bank-transactions-new-account-panel-filled.png` | 220 | Same, filled |
| `bank-transactions-from-to-picker.png` | 222 | From/To picker open: *+ Add new*, suppliers and customers with their type on the right |
| `bank-transactions-new-supplier-panel.png` | 223 | *Supplier* side panel (new supplier): contact type, currency, name and contact (title, names, display name, company, email, phones, website) |
| `bank-transactions-new-supplier-address.png` | 225 | Same: Address section |
| `bank-transactions-new-supplier-notes.png` | 226 | Same: Notes and attachments, Additional info (tax number, expense rates, payments) |
| `bank-transactions-new-supplier-save.png` | 227 | Same: bottom of the form, *Save* |
| `bank-transactions-split-transaction.png` | 231 | **Split transaction** full screen: bank account, date, full bank description, amount; lines with From/To, Category, Description, Amount; *Add lines*, *Reset*; split amount, original amount, difference; *Split and post* |
| `bank-transactions-full-width.png` | 235 | Bank transactions at full width (second sidebar hidden), Cheque no. column shown |

## Bank rules

| File | No. | What it shows |
|---|---|---|
| `bank-rules-list.png` | 165 | Rules: tabs Bank rules / Integration rules; search by name or conditions; table Priority, Rule name, Applied to, Conditions, Settings, Auto-add, Status, Actions (*Edit*); *Learn more*, *New rule* |

## Receipts

| File | No. | What it shows |
|---|---|---|
| `receipts-empty.png` | 163 | Receipts, empty: three upload tiles (from computer, Google Drive, by email), tabs For review / Reviewed, *Batch actions*, *Filter*, *Export*, an empty table |
| `receipts-list.png` | 237 | Receipts list: Receipt, Created by, Date, Description, Payment account, Amount/Tax, Category, Action (*Match* / *Review*) |
| `receipts-processing.png` | 238 | A receipt processing |
| `receipts-added-toast.png` | 239 | Toast "Document added for review" |
| `receipts-review-details.png` | 240 | **Uploaded receipt** review: the document image on the left, *Review details* form on the right (document type, payee, bank/credit account, payment date, total, description, account/category, ref no., memo), *Delete this receipt*, *Save and next* |
| `receipts-find-other-match.png` | 243 | *Find other match*: filters (transaction type, payment account, payee, dates, amounts) and a results table, *Match* |
| `receipts-list-create-expense.png` | 246 | Receipts list with one left, action *Create expense* |
| `receipts-row-action-menu.png` | 247 | Row action menu: *Delete*, *Find a Match* |
| `receipts-confirm-delete-modal.png` | 248 | *Confirm Delete* modal (*No* / *Yes*) |
| `receipts-deleted-toast.png` | 249 | Toast "Receipt deleted" |

## Reconcile

| File | No. | What it shows |
|---|---|---|
| `reconcile-start.png` | 250 | Reconcile start: breadcrumb (Chart of accounts / Bank register / Reconcile), *Summary* and *History by account*; account picker, beginning balance, statement ending balance and date; *Start reconciling* |
| `reconcile-session.png` | 251 | **Reconciling:** summary strip (statement ending balance − cleared balance; beginning balance, payments, deposits; difference with a warning icon), *Edit info*, *Save for later*; tabs Payments / Deposits / All; table with cleared ticks |
| `reconcile-session-payments-tab.png` | 252 | Same, Payments tab |

## Expenses, bills and suppliers

| File | No. | What it shows |
|---|---|---|
| `expenses-list.png` | 157 | Expenses (Expense transactions): tip banner, *All transactions* filter, *Filter*, date chip; table Date, Type, No., Payee, Category (inline picker), Total before sales tax, Sales tax, Total, Action; *Pay bills*, *New transaction* |
| `suppliers-list.png` | 253 | Suppliers: money bar (unpaid, overdue, open bills, paid last 30 days), search; table Supplier, Company, Phone, Email, Currency, Open balance, Action (*Create bill* / *Make payment*); *New supplier* |
| `bills-list.png` | 254 | Bills: tabs For review / Unpaid / Paid, supplier and bill date filters; table Supplier, Due date, Bill amount, Open balance, Status, Action (*Mark as paid*); *Pay bills*, *Add bill* |
| `pay-bills-empty.png` | 255 | Pay Bills, empty: "Looks like you don't have any bills to pay", *Enter new bill* |
| `bill-form-empty.png` | 256 | **Bill** full-screen form, empty: supplier, mailing address, terms, bill date, due date, bill no.; balance due top right; category lines; memo, attachments; *Save*, *Save and new* |
| `bill-form.png` | 257 | Same, supplier chosen |
| `bill-form-with-line.png` | 259 | Same, a line added ($24.00) |
| `bill-form-attachment.png` | 260 | Same, a file attached |
| `bill-form-save-menu.png` | 261 | Same, save menu open; *Mark as paid* |
| `expenses-list-bill-saved-toast.png` | 262 | Expenses list after saving; toast "Bill saved" |
| `bill-payment-form.png` | 263 | **Bill Payment** form: payee, bank account, payment date, ref no., outstanding transactions table, amounts to apply and credit; *Save and close* |
| `bills-list-payment-saved-toast.png` | 264 | Bills list after paying; toast |

## Sales: invoices, credit notes, sales, products

| File | No. | What it shows |
|---|---|---|
| `invoice-setup-wizard.png` | 044 | Invoice setup wizard: *Personalise your invoice template*, colour theme, logo upload, a preview "Your invoice is ready" |
| `invoice-editor.png` | 055 | **Invoice** full-screen editor: tabs Edit / Email view / PDF view; *Manage*, *Take tour*, *Feedback*; invoice header (company, logo, customer, email, bill to, number, dates, terms); right panel with collapsible Customisation, Payment options (toggles), Design, Scheduling; footer *Print or download*, *Make recurring*, *Save*, *Review and send* |
| `invoice-line-product-picker.png` | 058 | Product/service picker on a line (*+ Add new*, Consultation, Services) |
| `invoice-line-filled.png` | 059 | A line filled ($150) |
| `invoice-customisation-panel.png` | 060 | Customisation panel open: field toggles (Ship to, invoice no., dates, terms, table columns, custom fields) |
| `invoices-list.png` | 062 | Invoices list: unpaid/paid money bars, *Batch actions*, status and date filters; table Date, No., Customer, Amount, Status, Action (*View/Edit*, *Receive payment*); toast "Email sent" |
| `invoice-paid-in-full.png` | 063 | Invoice with two lines, one highlighted; status panel *Paid in full* |
| `invoice-customisation-table-columns.png` | 065 | Customisation panel's table-column toggles, beside the invoice lines |
| `invoice-design-panel.png` | 068 | Design panel: template, colour swatches, font |
| `invoice-design-colour-picker.png` | 069 | Same, colour picker |
| `invoice-design-share-link-menu.png` | 070 | Design panel; *Share link* menu at the bottom |
| `invoice-share-link-modal.png` | 072 | *Send your customer a link to their invoice* modal: link field, *Copy*, *Done* |
| `invoice-pdf-view.png` | 074 | PDF view, status *Paid in full* |
| `invoice-editor-empty.png` | 077 | Invoice 1004, new and empty |
| `credit-note-form.png` | 078 | **Credit note** full-screen form: customer, email, billing address, date, number; amount to credit top right; lines (service date, product/service, description, qty, rate, amount, sales tax); message fields; totals; *Save and send* |
| `credit-note-customer-picker.png` | 079 | Same, customer picker open (*+ Add new*, customers) |
| `credit-note-link-invoice-panel.png` | 080 | Same, customer chosen; right panel *To Link Invoice* with a filter |
| `credit-note-service-date-field.png` | 081 | Same, service date field active |
| `credit-note-date-picker.png` | 082 | Same, calendar open |
| `credit-note-product-picker.png` | 083 | Same, product picker |
| `credit-note-with-lines.png` | 084 | Same, two lines ($450) |
| `credit-note-send-email-modal.png` | 085 | *Send email* modal with a PDF preview |
| `credit-note-attachments.png` | 087 | Credit note with lines and an attachments area |
| `credit-note-attachment-error.png` | 088 | Same, an upload error |
| `credit-note-attachment-added.png` | 089 | Same, a PDF attached |
| `sales-transactions-list.png` | 265 | Sales transactions: money bar (estimates, unbilled income, overdue, open invoices, recently paid), filters, table; *New transaction* |
| `products-and-services-list.png` | 267 | Products & services list (name, description, category, SKU, type, price, cost, action); toast "Consultation saved" |
| `products-and-services-new-service-panel.png` | 268 | *Add a new service* side panel: basic info (name, type, SKU, category, image), Sales, Purchasing; *Save and new*, *Save and close* |
| `invoice-template-editor-design.png` | 317 | Invoice template editor ("Create invoices that turn heads…"): tabs Design / Content / Emails; design options list; live preview |
| `invoice-template-editor-styles.png` | 319 | Same: template styles row |
| `invoice-template-editor-font.png` | 320 | Same: font Helvetica |
| `invoice-template-editor-content.png` | 323 | Same: Content tab, header fields |
| `invoice-template-editor-emails.png` | 325 | Same: Emails tab with an email preview |

## Customer Hub, customers, leads

| File | No. | What it shows |
|---|---|---|
| `customer-hub-overview.png` | 159 | Customer Hub overview: customers funnel (open leads, open estimates, in-progress projects, unpaid invoices, reviews), work requests, referrals |
| `customer-hub-overview-estimates-tasks.png` | 270 | Customer Hub overview: open estimates, tasks ("You're caught up!") |
| `leads-list.png` | 271 | Leads: widgets (lead status donut, lead conversion bars, sources), tabs All / Needs attention, table; *Add lead* |
| `customers-list.png` | 272 | Customers list: money bar, search; table Name, Company, Phone, Currency, Open balance, Action (*Create invoice* / *Receive payment*); *New customer* |
| `leads-add-lead-panel.png` | 274 | *Add Lead* side panel: name and contact, communication permissions |
| `leads-add-lead-consent-addresses.png` | 277 | Same: marketing consent, addresses |
| `leads-list-inline-status-edit.png` | 279 | Leads list, a lead's status being edited inline |
| `leads-import-menu.png` | 281 | Leads list, *Import leads* in the *Add lead* menu |
| `leads-import-upload.png` | 282 | Import leads, step 1 of 3: *Upload your spreadsheet* (stepper on top) |
| `leads-import-map-columns.png` | 285 | Step 2: *Map your column headings* |
| `leads-import-review.png` | 286 | Step 3: review and confirm |
| `leads-list-imported.png` | 288 | Leads list after importing |

## Team: employees

| File | No. | What it shows |
|---|---|---|
| `employees-list.png` | 160 | Employees list: search, *Active employees* filter, table Display name, Email, Phone, Status; *Add an employee* |
| `employees-new-team-member-modal.png` | 290 | *Who's your new team member?* modal over the list |
| `employees-profile-picture-modal.png` | 294 | Employee profile with *Add a profile picture* modal |
| `employees-crop-photo-modal.png` | 295 | *Crop photo* modal |
| `employees-profile.png` | 297 | Employee profile: Personal info and Employment details cards with *Edit*; toast |
| `employees-profile-actions-menu.png` | 298 | Profile *Actions* menu (Change status, Run report) |
| `employees-edit-employment-details.png` | 299 | *Edit employment details* full screen (status, hire date, manager, department, job title, ID, billing rate) |

## Tax

| File | No. | What it shows |
|---|---|---|
| `tax-gst-overview.png` | 305 | GST overview: amounts collected and paid, tabs Returns / Payments, returns table, *Prepare return* |

## Company settings, users, billing

| File | No. | What it shows |
|---|---|---|
| `create-company-form.png` | 010 | Company profile form: name, logo, address, social links, business type, employees; promotion banner |
| `billing-upgrade.png` | 334 | Upgrade: billing info and subscription summary |
| `settings-company.png` | 340 | Settings › Company: side menu (Company, Usage, Accounting, Sales, Expenses, Time, Advanced); Company info rows with *Edit* |
| `settings-usage-limits.png` | 341 | Settings › Usage limits: chart of accounts and billable users meters |
| `settings-advanced.png` | 356 | Settings › Advanced: Automation, Currency (multicurrency on), Other preferences |
| `settings-advanced-saved.png` | 357 | Same, after saving: account numbers, automation, currency, date and number formats, duplicate warnings, sign-out after inactivity |
| `users-list.png` | 358 | Manage users: tabs Users / Accounting firms, search, table (name, email, status, role, billable, action); *Add user* |
| `users-add-user.png` | 359 | *Add user*: first and last name, email, *Assign roles* |
| `users-add-user-role.png` | 361 | Same, role *Standard all access* chosen with its description |
| `users-list-invite-sent.png` | 362 | Users list with the invite sent; toast |

## What this changes for the steps ahead

1. **The shell (step 2, built) differs from QuickBooks' structure.**
   QuickBooks has a full-width top bar (company name, global search,
   icons, avatar) above a narrow rail (Create, Bookmarks, Home, Feed,
   Reports, All apps, Pinned, Customise) and, inside an app, a second
   sidebar that is always the full app tree. The old app (and ours) has the
   rail full height with the logo, a header beside it, and a sub menu that
   starts closed. With "QuickBooks structure wins", the shell moves toward
   QuickBooks' arrangement; which parts come now and which wait for their
   features (global search, bookmarks, Create, Feed need gl-node) is a
   decision for the maintainer.
2. **Reports (step 4):** the filter bar above a centred report card with
   its own toolbar; a Compact / Normal density menu with Expand all and
   Collapse all; *Compare to* with Time periods and Calculations;
   *Add note*; the "basis · timestamp" footer; a Standard reports page
   grouped into collapsible sections with favourite stars and a left
   sub-menu (Standard, Custom, Management reports). Save as, email,
   export, custom and management reports need storage or new gl-node
   features.
3. **Chart of accounts (step 5):** the *All lists* breadcrumb, *Batch
   actions*, a Currency column, and *Account history* as the row action
   for balance sheet accounts.
4. **Bank transactions (step 6):** close to the old app already. New from
   QuickBooks: the *Columns* panel (show, hide, reorder), the transaction
   type filter (money in, money out, …), the custom date range, the
   account card menu, *Split* as a full-screen form, and the category
   picker's *Suggested* / *All accounts* / *+ Add new account*.
5. **Wording:** these screenshots are in British/Singapore English
   (*Supplier*, *Customise*, *Cheque*); the old app is in US English
   (*Vendor*, *Customize*, *Check*). The old app's US English stays unless
   the maintainer says otherwise.
