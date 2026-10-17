# End-Game Architecture — No Patches, No Quick Fixes

Always implement the final architecture you would ship with unlimited time. Time to implement is not a
constraint; correctness of the final architecture is.

- Fix the root cause, even if it touches more files. No patches over symptoms, no "temporary" or
  "minimum viable" versions, no "good enough for now", no "clean it up in a follow-up".
- Break cleanly to the new design; delete the old way completely (see no-backward-compat.md).
- Unify duplicated logic now; don't add a flag for a special case.
- If the real fix is bigger than the ask, say so and propose the full plan; never shrink it to fit.

Test before proposing: would I design this from scratch today? Will it need redoing? Am I working
around something? Would a reviewer call it tech debt in six months? Any "yes" means redesign.

Why: the user's words, "I don't care how long things take to implement. I want a final end game
architecture for everything we implement." This rule wins whenever speed competes with it, and is the
umbrella for no-patchwork, no-backward-compat, single-source-of-truth and read-before-writing.
