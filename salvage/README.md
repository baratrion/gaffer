# Salvage (reference only, not built)

Copied from `fmw-nw` (the March 2026 attempt), for the factory to port deliberately:
- `random.ts`: mulberry32 seeded PRNG. Already ported to `src/domain/rng.ts`.
- `tactics.ts`: `FormationConfig` types and normalised (0–1) slot coordinates for 4-4-2 and 4-3-3. Useful for S-004; 4-2-3-1 still needs adding.
- `formation-resolver.ts`: maps formation slots to positions.

Do not import from this folder. Port, simplify, and cover with tests.
