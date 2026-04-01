# Clean Code Agent Instructions

This file is mirrored across CLAUDE.md, AGENTS.md, GEMINI.md, and CLEAN_CODE.md so the same engineering standards load in any AI environment.

You operate within a Clean Code architecture that separates intent, structure, and implementation to maximize readability, maintainability, and correctness.
Software that merely works is insufficient — it must also be understandable, evolvable, and safe to change.
This system ensures that generated or modified code remains human-quality, not just machine-valid.

---

# The 3-Layer Code Quality Model

## Layer 1: Intent (What the code means)

The semantic purpose of the code — domain meaning and business intent.

Defines:
- domain concepts
- invariants and rules
- expected behavior
- contracts and side effects
- input/output semantics

This layer answers:
“Why does this exist?”

Code at this layer should reflect domain language, not technical mechanics.

Examples:
- calculate_invoice_total
- user_has_active_subscription
- mark_order_as_shipped

Not:
- processData
- handleStuff
- doLogic

Intent must be explicit in names and structure.

---

## Layer 2: Structure (How the logic is organized)

The architectural and logical composition of behavior.

Defines:
- function boundaries
- module responsibilities
- dependency direction
- abstraction levels
- separation of concerns

Rules:
- One function = one responsibility
- One module = one reason to change
- High-level policy must not depend on low-level details
- Call hierarchy should read like a narrative

Good structure allows reading code top-down without mental jumps.

---

## Layer 3: Implementation (How the machine executes)

The concrete operations and syntax.

Includes:
- loops
- conditionals
- API calls
- persistence
- data transforms
- algorithms

Implementation must be:
- minimal
- explicit
- unsurprising
- duplication-free
- side-effect controlled

This layer must never leak complexity upward.

---

# Why this works

If intent, structure, and implementation are mixed:
- names lose meaning
- functions grow
- duplication spreads
- bugs hide
- changes become dangerous

Separating them ensures:
- readability
- safe refactoring
- testability
- long-term evolution

---

# Operating Principles

## 1. Name for intent, not mechanics
Names must describe purpose, not process.

Prefer:
- invoice_total
- expired_sessions
- send_password_reset_email

Avoid:
- data
- list
- obj
- tmp
- handler
- util

If a name needs a comment, the name is wrong.

---

## 2. Functions must be small and singular
A function should do one thing.

Signs it does too much:
- multiple verbs in name
- nested conditionals
- more than one abstraction level
- comments separating sections

Target:
- 5–20 lines typical
- single conceptual step
- no mixed responsibilities

---

## 3. Abstraction levels must not mix
Do not combine:
- high-level policy
- mid-level orchestration
- low-level mechanics

Bad:
processOrder():
  validate input
  calculate tax
  for item in db.query(...)

Good:
process_order():
  validate_order()
  totals = calculate_totals()
  persist_order(totals)

---

## 4. Eliminate duplication aggressively
Duplication includes:
- logic
- condition patterns
- algorithms
- validation rules
- magic constants

Rule:
If two places change together, they must live together.

---

## 5. Make illegal states unrepresentable
Prefer modeling over validation.

Instead of:
status: string

Prefer:
enum OrderStatus { Pending, Paid, Shipped, Cancelled }

Constraints belong in types and structure.

---

## 6. Comments are last resort
Good code explains itself.

Allowed comments:
- rationale (“why”)
- non-obvious constraints
- external requirements
- legal or protocol notes

Avoid:
- restating code
- narrating steps
- obvious explanations

---

## 7. Errors must be explicit and meaningful
Never:
- swallow errors
- return null silently
- use generic messages

Errors should:
- describe cause
- include context
- be actionable
- preserve stack or chain

---

## 8. Side effects must be visible
Functions that mutate state must signal it.

Prefer names like:
- save_user
- mark_paid
- delete_session

Pure functions should remain pure.

---

## 9. Structure for reading, not writing
Code is read far more than written.

Optimize for:
- scanning
- navigation
- comprehension
- change safety

Not for:
- cleverness
- brevity tricks
- density

---

## 10. Refactor continuously
Every modification must improve:
- names
- structure
- duplication
- clarity

Leave code better than found.

---

# Self-Improving Loop

When code smells appear:
- rename for clarity
- extract function
- remove duplication
- raise abstraction
- simplify branches

Then:
- ensure tests still pass
- verify behavior unchanged
- commit improvement

Clean code compounds.

---

# Code Smell Signals

Refactor immediately if you see:
- long functions
- vague names
- boolean flags controlling behavior
- deep nesting
- repeated conditionals
- mixed abstraction
- comment blocks explaining code
- temporary variables spreading
- data clumps
- switch/if chains on type

These indicate structural decay.

---

# Testing Alignment

Clean code enables clean tests.

Tests should be:
- readable
- intention-revealing
- independent
- deterministic

If tests are hard to write, code structure is wrong.

---

# Summary

You generate and modify code that humans must understand and evolve.

Preserve intent in names.
Preserve structure in composition.
Minimize implementation complexity.

Separate meaning from mechanics.
Eliminate duplication.
Make states explicit.
Refactor relentlessly.

Write code that communicates.

Be clear.
Be small.
Be predictable.
Build systems humans can trust.
