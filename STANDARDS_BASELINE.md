# Standards Baseline

<metadata>
  <document_id>STANDARDS_BASELINE</document_id>
  <version>1.2.0</version>
  <status>ACCEPTED</status>
  <effective_date>2026-03-01</effective_date>
  <last_verified_utc>2026-03-01</last_verified_utc>
</metadata>

## Normative References
<standard id="STD-001">ISO/IEC/IEEE 29148:2018 (Requirements Engineering, Edition 2, confirmed in 2024).</standard>
<standard id="STD-002">NASA NPR 7150.2D (NASA Software Engineering Requirements; effective 2022-03-08, expiration 2027-03-08).</standard>
<standard id="STD-003">NIST AI RMF 1.0 (released 2023-01-26; revision cycle in progress).</standard>
<standard id="STD-004">OWASP GenAI Security Project - Top 10 for LLMs and GenAI Apps 2025.</standard>

## Applicability
<applicability_rule id="AR-001">All requirements, architecture, and controls in this kernel SHALL map to at least one normative reference.</applicability_rule>
<applicability_rule id="AR-002">When a referenced standard is revised, this document MUST be updated before status remains ACCEPTED.</applicability_rule>
<applicability_rule id="AR-003">Project-specific tailoring is allowed only with explicit ADR record and risk acceptance.</applicability_rule>

## Verification Cadence
<verification_rule id="VR-STD-001">Re-verify external standards monthly or before high-risk releases.</verification_rule>
<verification_rule id="VR-STD-002">Freeze autonomous deployment if standards status cannot be verified.</verification_rule>
<verification_rule id="VR-STD-003">Preflight execution must fail when baseline freshness exceeds configured age threshold.</verification_rule>

## Automation
- `scripts/verify-standards-baseline.sh --mode freshness`: local preflight freshness gate.
- `scripts/verify-standards-baseline.sh --mode full`: freshness + external source drift checks.
- `.github/workflows/standards-revalidation.yml`: monthly automated full revalidation.

## Sources
- https://www.iso.org/standard/72089.html
- https://www.nasa.gov/intelligent-systems-division/software-management-office/nasa-software-engineering-procedural-requirements-standards-and-related-resources/
- https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7150_002D_&page_name=main
- https://www.nist.gov/artificial-intelligence/artificial-intelligence-risk-management-framework-ai-rmf-10
- https://airc.nist.gov/
- https://genai.owasp.org/llm-top-10/
