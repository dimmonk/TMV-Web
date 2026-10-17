# No Assumptions — Verify Everything

Never claim code behaves, renders or works a certain way without reading every layer involved: the
markup, the styles that target it, the JS that manipulates it, and the imports it relies on. If you
haven't, say "let me check". After a refactor or mass change, run a verification grep instead of
trusting the diff.

Use words precisely: "tested" = tests ran and passed, "verified" = code read carefully, "should work" =
a guess.

Why: claimed two elements rendered alike (one had a different `::before`); claimed a refactor complete
(9 call sites remained).
