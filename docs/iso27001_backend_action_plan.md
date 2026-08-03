# ISO/IEC 27001:2022 Backend Action Plan

## Scope
This plan implements the remaining high-impact controls for ISO/IEC 27001:2022 + BSI IT-Grundschutz alignment.

## Workstream 1: Auth + MFA + SSO
- Implement OIDC/SAML2 login flows with Entra ID/Okta.
- Enforce MFA for `Admin`, `Agent`, `CISO / ISB` roles.
- Move from localStorage token to HttpOnly/Secure session cookies.
- Capture audit events for login success/failure and MFA verification.

## Workstream 2: Ticket Workflow + DB Immutability
- Persist state machine in backend (`Logged -> ... -> Audit Ready`).
- Validate transitions server-side.
- Block all update/delete operations after `Audit Ready` and `Closed`.
- Enforce mandatory fields by ticket type (`Incident`, `Risk`, `Change`, `ServiceHR`).

## Workstream 3: Audit Trail + SIEM + Retention
- Write append-only audit records for auth, view, update, role changes.
- Forward logs to SIEM (Sentinel/ELK) with correlation IDs.
- Retain logs for minimum 12 months.
- Add tamper-evidence controls and periodic integrity checks.

## Workstream 4: ITAM/CMDB Connector
- Add GLPI/Snipe-IT connector with token rotation.
- Resolve asset owner, classification, CIA values at ticket creation.
- Calculate initial priority and routing from CIA/classification.
- Track sync health and last sync timestamp.

## Workstream 5: CAPA + Management Review
- Require RCA method (5 Whys/Fishbone) for major incidents.
- Create corrective-action sub-ticket and due date automatically.
- Add 30/60/90 day effectiveness checks.
- Surface CAPA status KPI (`Open`, `Delayed`, `Verified`) for Clause 9.3 reporting.

## Suggested Delivery Sequence
1. Auth hardening (MFA + SSO + session model)
2. Workflow engine + immutable DB constraints
3. Audit and SIEM pipeline
4. ITAM connector and risk scoring
5. CAPA automation and reporting

## Definition of Done (System-Level)
- Closed and audit-ready tickets are immutable at API + DB level.
- Privileged security queue is restricted to CISO/ISB-approved roles.
- MFA is enforced for privileged accounts.
- SIEM receives and stores required log streams for 12 months.
- Audit evidence export is available for external certification audits.
