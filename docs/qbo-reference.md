# QuickBooks Online reference screenshots

Status: analysis of 2026-11-25.

208 screenshots of QuickBooks Online's web app (April 2026, collected by
Mobbin), in `.do_not_commit_ignore/source-qbo-screenshots/` (not
committed), named `QuickBooks Web Apr 2026 NNN.png`; the tables below give
the number. The company in them is a Singapore one, so the wording is
British/Singapore English: *Supplier* (US *Vendor*), *Customise*,
*Cheque*, *Favourites*, *GST*, dates as DD/MM/YYYY.

**How they're used (maintainer, 2026-11-25):** a reference for structure
and positions: where things sit on each screen, how a screen is put
together, which controls exist. Not the source of truth for colours,
fonts or styling, which stay the old app's. **When the old app and these
screenshots disagree on structure, QuickBooks' structure wins.** Our UX
improvements go on top and are noted in each parity checklist. Never
carried over: QuickBooks' or Intuit's name, logo, brand artwork or
product names.

## Areas at a glance

| Area | Screenshots | Our step |
|---|---|---|
| App shell, home and navigation | 26, 86, 90–102, 306–314, 338, 369 | 2 (built), Home later |
| Sign-in and account security | 365, 368, 371, 372, 374 | 3 (built); 013 later |
| Reports | 106–131, 134–154 | **4, next** |
| Chart of accounts and accounts | 166, 178, 194, 195, 219, 220 | 5 |
| Bank transactions | 186–235 | 6 |
| Bank rules | 165 | later |
| Receipts | 163, 237–249 | later (store) |
| Reconcile | 250–252 | later (after 014) |
| Expenses, bills, suppliers | 157, 253–264 | later (store) |
| Sales: invoices, credit notes, sales, products | 44, 55–89, 265–268, 317–326 | later (store) |
| Customer Hub, customers, leads | 159, 270–289 | later (store) |
| Team: employees | 160, 290–301 | later (store) |
| Tax (GST) | 305 | not planned |
| Company settings, users, billing | 10, 334, 340–362 | later |

## App shell, home and navigation

| File | What it shows |
|---|---|
| 026 | Home on first use: "Good morning" greeting, app chips (Accounting, Expenses & Pay Bills, Sales & Get Paid, Customers, Team, Tax), Business Feed, Create actions, Business at a glance; a right-hand **Tasks** panel with setup tasks and progress |
| 086 | Home ("Good afternoon"): Business Feed card, Create actions chips (Create invoice, Record expense, …), Business at a glance widgets (Profit & loss bars, Expenses donut, Add widgets, Bank accounts); a toast at the top of the search bar |
| 090 | Home with the **Bookmarks** flyout open from the rail (empty, *Bookmark current page*) |
| 091 | Bookmark creation popover: label field, *Remove* / *Save* |
| 092 | Bookmarks flyout listing *Home*; toast "Bookmark saved for Home" |
| 093 | *Customise your bookmarks* modal: search, checkbox list of pages (Home, Feed, Standard reports, Custom reports, Management reports, Cash flow overview, Bank transactions, Integration transactions, Receipts), *Cancel* / *Save* |
| 094 | Same modal with Bank transactions ticked |
| 095 | Home after saving; toast "Menu changes saved" |
| 096 | Home: Profit & loss widget's period menu (This fiscal quarter … Last fiscal year) |
| 097 | Home: Business at a glance with Sales and Accounts receivable suggestion chips in the Add widgets card |
| 099 | Home with an **Add widgets** side panel: checkbox groups (Operational, Smart suggestions, All widgets), *Cancel* / *Save* |
| 100 | Home scrolled: Cash flow area chart (Cash balance / Money in-out toggle), Sales and Accounts receivable widgets |
| 102 | Home: Accounts receivable donut widget with ageing buckets |
| 306 | *Customise your app menus* modal over Home: drag handles to reorder the pinned apps, *Reset to default*, *Cancel* / *Save* |
| 307 | Same modal, reordered |
| 308 | Home after customising; toast "Customisation saved" |
| 310 | **Global search** dropdown from the top bar: recent Transactions (type, number, contact, date, amount), Contacts, Ledger accounts, a link to advanced search |
| 311 | *Advanced transactions search* page: filters (Date range, Transaction type, Reference number, Contact, Amount), results table (date, type, ref no., contact, due date, balance, amount, memo, last modified) |
| 313 | Notifications panel from the top bar (Inbox / Recommended tabs, empty state "All clear") |
| 314 | Gear menu from the top bar: four columns (Your company, Lists, Tools, Profile); a banner to switch back to the previous experience |
| 338 | Avatar menu from the top bar: name, email, *Manage your account*, *Sign out* |
| 369 | Home with the Tasks setup panel (first-run checklist with progress bar) |

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

| File | What it shows |
|---|---|
| 365 | Sign-in, password step: centred card, the account's email, *Use a different account*, password field with *Show*, *Continue*, *Text a code*, *Forgot password?*; legal footer |
| 368 | Same, password typed |
| 371 | Email verification step: 6-digit code field, *Continue*, *I didn't get an email* |
| 372 | Same, code typed and accepted |
| 374 | *It's time to update your password*: new and confirm fields with live rule checks (length, cases, number, symbol), *Update password*, *Skip* |

## Reports

| File | What it shows |
|---|---|
| 106 | Profit and loss report page: *Back*, title "Profit and loss reports", a one-line tip, the filter bar, then the report card (Compact density) |
| 107 | **Profit and Loss, the full layout:** filter bar on top (*Report period*, *From*, *To*, *Accounting method* Cash / Accrual toggle, *Display columns by*, *Compare to*; *Customise*, *Save as*); centred report card with a toolbar (Compact menu, refresh, email, print, export, more), title, company, period; columns *Account* / *Total*; collapsible Income, Gross Profit, Expenses, Net Operating Income, Other Expenses, Net Income; footer "Accrual basis · timestamp" and *Add note*; a *Categorise transactions* button bottom right |
| 108 | *Save as new report?* modal: report name, *Share with others* toggle, *Add to group*, *Cancel* / *Save* |
| 109 | Same, sharing on |
| 110 | P&L comparing two months (current, previous, $ change columns), renamed "… - copy"; toast "saved to custom reports tab" |
| 111 | Compact menu open: *Compact view* / *Normal view*, *Expand all* / *Collapse all* |
| 112 | P&L with every section collapsed to its totals |
| 115 | *Send Profit and Loss* email modal: To, Cc, Subject, Format (Excel, CSV, PDF), Orientation, Message, File name, *Cancel* / *Send email* |
| 116 | Same, message written |
| 117 | P&L page with toast "Email for report sent successfully" |
| 118 | Report title being edited in place on the card |
| 119 | Report with a custom title |
| 120 | *Add note* open: a text box under the report (4,000 characters) |
| 121 | Note typed |
| 122 | Note saved, shown under the report above the basis line |
| 124 | P&L for Last quarter (October–December), no activity: rows with dashes |
| 125 | **Compare to** menu open: Time periods (Previous year, Previous period, Year-to-date, Previous year-to-date, Custom period) and Calculations (% of Row, % of Column, % of Expense, % of Income), with checkboxes |
| 128 | P&L compared with the previous period: two value columns and $ change |
| 129 | Save as new report modal: sharing on, *+ Add new group* |
| 130 | Same: new group name field |
| 131 | Same: group name filled |
| 134 | **Reports & Analytics, Standard reports:** left sub-menu (Standard reports, Custom reports, Management reports, Financial planning: Cash flow overview, Cash flow planner); search box; collapsible groups *Favourites*, *Business overview*, *Who owes you*; two columns of report names, each with a favourite star and a more menu |
| 135 | Custom reports tab: help banner, table (Report name, Created by, Date range, Action), empty |
| 136 | Management reports tab: table (Name, Created by, Last modified, Report period, Action *Preview*), *+ Management report* |
| 139 | Create management report editor: page thumbnails on the left, cover page form (template, logo, title, subtitle, period, prepared on/by, disclaimer), live preview on the right; *Preview report*, *Save*, *Save and close* |
| 140 | Same: cover template picker (Default, Standard, Madison, Atlas) |
| 144 | Same: preliminary pages, a rich-text editor |
| 146 | Same: *Reports and charts* page listing the reports included, *Add* |
| 147 | Management reports list with the new report |
| 148 | Rich-text editor, a paragraph selected |
| 149 | Same, formatting toolbar in use |
| 153 | Same, text colour picker |
| 154 | Same, heading coloured |

## Chart of accounts and accounts

| File | What it shows |
|---|---|
| 166 | **Chart of accounts:** breadcrumb *< All lists*; title with *Give feedback*, *Run report*, *New account* (split button); toolbar *Batch actions*, *Filter by name or number*, a type filter, edit/print/settings icons, pager; table columns checkbox, Name, Account type, Detail type, Currency, QuickBooks balance, Bank balance, Action (*Account history* or *Run report*, with a menu) |
| 178 | *Connect an account* flow with the *New account* side panel: account name, account type and detail type, *Make this a subaccount*, opening balance and *as of* date, currency, description, a balance sheet preview of where the account will sit; *Cancel* / *Save* |
| 194 | *Edit Account* side panel opened from Bank transactions: name, account type, detail type, subaccount, currency (locked), description, bank connection with *Disconnect*, balance |
| 195 | Same, name changed |
| 219 | *New account* side panel from a bank transaction's category picker (empty) |
| 220 | Same, filled (Expenses / Supplies), with a Profit & loss preview of where it will sit |

## Bank transactions

| File | What it shows |
|---|---|
| 186 | **Bank transactions:** account picker (*Main*), account card (*Bank: $47.40*, posted balance, last update), header *Give feedback*, *Update*, *Requests*, *Link account*; tabs Pending / Posted / Excluded; links *Switch to previous version*, *Tutorial*, *Go to bank register*; Posted tab: Date, Bank description, Spent, Received, From/To, Match/Category, Transaction posted, *Undo* |
| 187 | Excluded tab: Date, Bank description, Amount, *Undo* |
| 188 | Pending tab with a row expanded: full bank description, Match / Categorise toggle, transaction type, account, From/To, memo, file upload; *Post*, *Split*, *Create rule*, *Exclude*; *Categorisation history* |
| 189 | Same, category and supplier chosen |
| 190 | Same |
| 191 | Same, a file attached |
| 192 | Pending list after posting; toast "Transaction posted" |
| 194 | Pending list with the account card's menu (edit account sign-in, edit details, disconnect) and the *Edit Account* panel |
| 195 | Same |
| 198 | The newer banking layout: an AI-features banner, tabs For review / Categorised / Excluded, columns Description, Payee, Category or match, Spent, Received, *Add*; *Try new banking page* |
| 199 | Search with no results: "We couldn't find transactions that match your search" |
| 200 | Search with results |
| 202 | Date filter: Custom with a calendar |
| 204 | Date filter: From / To fields, *Reset* / *Apply* |
| 205 | Custom range applied |
| 206 | Transaction filter menu: All transactions, Money in, Money out, Suggested matches, Transfers, Rules, Missing From/To |
| 207 | *Money in* applied |
| 208 | **Columns** panel from the settings icon: drag to reorder, checkboxes (Date, Cheque no., Bank description, Spent, Received, Files, Requests, From/To, Product/Service, Match/Category, Action) |
| 209 | Same, Cheque no. shown |
| 210 | Same |
| 211 | Money-in list with a Cheque no. column |
| 212 | Columns being dragged into a new order |
| 213 | Columns panel |
| 218 | Category picker open on an expanded row: *Suggested* accounts, *All accounts*, *+ Add new account* |
| 219 | *New account* panel from the category picker |
| 220 | Same, filled |
| 221 | Pending row expanded |
| 222 | From/To picker open: *+ Add new*, suppliers and customers with their type on the right |
| 223 | *Supplier* side panel (new supplier): contact type, currency, name and contact (title, names, display name, company, email, phones, website) |
| 224 | Same, filled |
| 225 | Same: Address section |
| 226 | Same: Notes and attachments, Additional info (tax number, expense rates, payments) |
| 227 | Same: bottom of the form, *Save* |
| 231 | **Split transaction** full screen: bank account, date, full bank description, amount; lines with From/To, Category, Description, Amount; *Add lines*, *Reset*; split amount, original amount, difference; *Split and post* |
| 232 | Pending list after posting; toast |
| 235 | Bank transactions at full width (second sidebar hidden), Cheque no. column shown |

## Bank rules

| File | What it shows |
|---|---|
| 165 | Rules: tabs Bank rules / Integration rules; search by name or conditions; table Priority, Rule name, Applied to, Conditions, Settings, Auto-add, Status, Actions (*Edit*); *Learn more*, *New rule* |

## Receipts

| File | What it shows |
|---|---|
| 163 | Receipts, empty: three upload tiles (from computer, Google Drive, by email), tabs For review / Reviewed, *Batch actions*, *Filter*, *Export*, an empty table |
| 237 | Receipts list: Receipt, Created by, Date, Description, Payment account, Amount/Tax, Category, Action (*Match* / *Review*) |
| 238 | A receipt processing |
| 239 | Toast "Document added for review" |
| 240 | **Uploaded receipt** review: the document image on the left, *Review details* form on the right (document type, payee, bank/credit account, payment date, total, description, account/category, ref no., memo), *Delete this receipt*, *Save and next* |
| 241 | Same, filled |
| 243 | *Find other match*: filters (transaction type, payment account, payee, dates, amounts) and a results table, *Match* |
| 244 | Same, a match selected |
| 246 | Receipts list with one left, action *Create expense* |
| 247 | Row action menu: *Delete*, *Find a Match* |
| 248 | *Confirm Delete* modal (*No* / *Yes*) |
| 249 | Toast "Receipt deleted" |

## Reconcile

| File | What it shows |
|---|---|
| 250 | Reconcile start: breadcrumb (Chart of accounts / Bank register / Reconcile), *Summary* and *History by account*; account picker, beginning balance, statement ending balance and date; *Start reconciling* |
| 251 | **Reconciling:** summary strip (statement ending balance − cleared balance; beginning balance, payments, deposits; difference with a warning icon), *Edit info*, *Save for later*; tabs Payments / Deposits / All; table with cleared ticks |
| 252 | Same, Payments tab |

## Expenses, bills and suppliers

| File | What it shows |
|---|---|
| 157 | Expenses (Expense transactions): tip banner, *All transactions* filter, *Filter*, date chip; table Date, Type, No., Payee, Category (inline picker), Total before sales tax, Sales tax, Total, Action; *Pay bills*, *New transaction* |
| 253 | Suppliers: money bar (unpaid, overdue, open bills, paid last 30 days), search; table Supplier, Company, Phone, Email, Currency, Open balance, Action (*Create bill* / *Make payment*); *New supplier* |
| 254 | Bills: tabs For review / Unpaid / Paid, supplier and bill date filters; table Supplier, Due date, Bill amount, Open balance, Status, Action (*Mark as paid*); *Pay bills*, *Add bill* |
| 255 | Pay Bills, empty: "Looks like you don't have any bills to pay", *Enter new bill* |
| 256 | **Bill** full-screen form, empty: supplier, mailing address, terms, bill date, due date, bill no.; balance due top right; category lines; memo, attachments; *Save*, *Save and new* |
| 257 | Same, supplier chosen |
| 258 | Same, terms and number filled |
| 259 | Same, a line added ($24.00) |
| 260 | Same, a file attached |
| 261 | Same, save menu open; *Mark as paid* |
| 262 | Expenses list after saving; toast "Bill saved" |
| 263 | **Bill Payment** form: payee, bank account, payment date, ref no., outstanding transactions table, amounts to apply and credit; *Save and close* |
| 264 | Bills list after paying; toast |

## Sales: invoices, credit notes, sales, products

| File | What it shows |
|---|---|
| 044 | Invoice setup wizard: *Personalise your invoice template*, colour theme, logo upload, a preview "Your invoice is ready" |
| 055 | **Invoice** full-screen editor: tabs Edit / Email view / PDF view; *Manage*, *Take tour*, *Feedback*; invoice header (company, logo, customer, email, bill to, number, dates, terms); right panel with collapsible Customisation, Payment options (toggles), Design, Scheduling; footer *Print or download*, *Make recurring*, *Save*, *Review and send* |
| 056 | Same, customer chosen |
| 057 | Same, customer email filled |
| 058 | Product/service picker on a line (*+ Add new*, Consultation, Services) |
| 059 | A line filled ($150) |
| 060 | Customisation panel open: field toggles (Ship to, invoice no., dates, terms, table columns, custom fields) |
| 062 | Invoices list: unpaid/paid money bars, *Batch actions*, status and date filters; table Date, No., Customer, Amount, Status, Action (*View/Edit*, *Receive payment*); toast "Email sent" |
| 063 | Invoice with two lines, one highlighted; status panel *Paid in full* |
| 064 | Same, status panel |
| 065 | Customisation panel with lines |
| 066 | Invoice 1004 with Customisation; amounts *Exclusive of tax* |
| 067 | Same |
| 068 | Design panel: template, colour swatches, font |
| 069 | Same, colour picker |
| 070 | Design panel; *Share link* menu at the bottom |
| 072 | *Send your customer a link to their invoice* modal: link field, *Copy*, *Done* |
| 074 | PDF view, status *Paid in full* |
| 077 | Invoice 1004, new and empty |
| 078 | **Credit note** full-screen form: customer, email, billing address, date, number; amount to credit top right; lines (service date, product/service, description, qty, rate, amount, sales tax); message fields; totals; *Save and send* |
| 079 | Same, customer picker open (*+ Add new*, customers) |
| 080 | Same, customer chosen; right panel *To Link Invoice* with a filter |
| 081 | Same, service date field active |
| 082 | Same, calendar open |
| 083 | Same, product picker |
| 084 | Same, two lines ($450) |
| 085 | *Send email* modal with a PDF preview |
| 087 | Credit note with lines and an attachments area |
| 088 | Same, an upload error |
| 089 | Same, a PDF attached |
| 265 | Sales transactions: money bar (estimates, unbilled income, overdue, open invoices, recently paid), filters, table; *New transaction* |
| 266 | Invoices list (money bars, filters, table) |
| 267 | Products & services list (name, description, category, SKU, type, price, cost, action); toast "Consultation saved" |
| 268 | *Add a new service* side panel: basic info (name, type, SKU, category, image), Sales, Purchasing; *Save and new*, *Save and close* |
| 317 | Invoice template editor ("Create invoices that turn heads…"): tabs Design / Content / Emails; design options list; live preview |
| 319 | Same: template styles row |
| 320 | Same: font Helvetica |
| 321 | Same: font Courier |
| 323 | Same: Content tab, header fields |
| 324 | Same: Content tab, form names and numbers |
| 325 | Same: Emails tab with an email preview |
| 326 | Same |

## Customer Hub, customers, leads

| File | What it shows |
|---|---|
| 159 | Customer Hub overview: customers funnel (open leads, open estimates, in-progress projects, unpaid invoices, reviews), work requests, referrals |
| 270 | Customer Hub overview: open estimates, tasks ("You're caught up!") |
| 271 | Leads: widgets (lead status donut, lead conversion bars, sources), tabs All / Needs attention, table; *Add lead* |
| 272 | Customers list: money bar, search; table Name, Company, Phone, Currency, Open balance, Action (*Create invoice* / *Receive payment*); *New customer* |
| 274 | *Add Lead* side panel: name and contact, communication permissions |
| 275 | Same, filled |
| 277 | Same: marketing consent, addresses |
| 278 | Leads list with two leads |
| 279 | Same, a status being edited inline |
| 280 | Same |
| 281 | Same, *Import leads* in the *Add lead* menu |
| 282 | Import leads, step 1 of 3: *Upload your spreadsheet* (stepper on top) |
| 283 | Same, a file uploaded |
| 285 | Step 2: *Map your column headings* |
| 286 | Step 3: review and confirm |
| 287 | Same, some rows can't be imported |
| 288 | Leads list after importing |
| 289 | Same |

## Team: employees

| File | What it shows |
|---|---|
| 160 | Employees list: search, *Active employees* filter, table Display name, Email, Phone, Status; *Add an employee* |
| 290 | *Who's your new team member?* modal over the list |
| 294 | Employee profile with *Add a profile picture* modal |
| 295 | *Crop photo* modal |
| 297 | Employee profile: Personal info and Employment details cards with *Edit*; toast |
| 298 | Profile *Actions* menu (Change status, Run report) |
| 299 | *Edit employment details* full screen (status, hire date, manager, department, job title, ID, billing rate) |
| 300 | Same, filled |
| 301 | Employees list with two |

## Tax

| File | What it shows |
|---|---|
| 305 | GST overview: amounts collected and paid, tabs Returns / Payments, returns table, *Prepare return* |

## Company settings, users, billing

| File | What it shows |
|---|---|
| 010 | Company profile form: name, logo, address, social links, business type, employees; promotion banner |
| 334 | Upgrade: billing info and subscription summary |
| 340 | Settings › Company: side menu (Company, Usage, Accounting, Sales, Expenses, Time, Advanced); Company info rows with *Edit* |
| 341 | Settings › Usage limits: chart of accounts and billable users meters |
| 356 | Settings › Advanced: Automation, Currency (multicurrency on), Other preferences |
| 357 | Same, after saving: account numbers, automation, currency, date and number formats, duplicate warnings, sign-out after inactivity |
| 358 | Manage users: tabs Users / Accounting firms, search, table (name, email, status, role, billable, action); *Add user* |
| 359 | *Add user*: first and last name, email, *Assign roles* |
| 360 | Same, filled |
| 361 | Same, role *Standard all access* chosen with its description |
| 362 | Users list with the invite sent; toast |

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
