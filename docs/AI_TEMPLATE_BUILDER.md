# Veyra AI Template Builder — Future Architecture

The AI template builder is intentionally deferred from the initial product release, but the platform is designed to support it later without introducing a second rendering architecture.

## Contract

AI generates a validated, versioned Veyra template definition rather than arbitrary executable application code.

```text
Prompt
  -> AI generation
  -> Template Definition
  -> schema validation
  -> capability validation
  -> accessibility/performance checks
  -> preview
  -> publish
```

## Template definition

A definition can describe:

- page structure and sections
- component composition
- design tokens
- responsive behavior
- supported customization capabilities
- template metadata
- version and compatibility information

## Reuse the existing renderer

```text
Human-designed template ─┐
                          ├─> Veyra Template Renderer ─> Public Site
AI-generated template ────┘
```

AI-created templates therefore inherit platform safeguards, analytics, privacy controls, accessibility requirements, media handling and entitlement enforcement.

## Premium access

AI template creation and publishing are feature capabilities. Their availability is controlled by the entitlement system, not hard-coded against a particular plan.

## Versioning

Generated templates are immutable published versions. A creator's active site remains pinned to its selected version until the creator explicitly changes it, subject to exceptional security/compatibility intervention.
