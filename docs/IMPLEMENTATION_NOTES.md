# Implementation Notes

This repository now includes frontend scaffolding for ISO-oriented controls:
- Typed ticket templates (Incident, Risk, Change, ServiceHR)
- Incident state machine and immutability checks
- CISO/ISB privileged sensitive queue in agent ticket view
- Audit logs, CAPA, and integrations admin pages
- API contracts for backend implementation in docs/openapi

Current limitation:
- Runtime still uses mock mode in frontend service layer (`USE_MOCK = true`).
- To connect real backend, switch the flag to `false` and implement API endpoints from the OpenAPI contract.
