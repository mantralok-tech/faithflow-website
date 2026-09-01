#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Updates the published contact details across every page of the site.

Edit NEW below, then run:  python3 fill-contact-details.py
Payment gateways verify these against your incorporation documents, so the
address must match your LLP registration and the phone must be answered.
"""
CURRENT = {
    "tel":     "+917386247397",
    "phone":   "+91 73862 47397",
    "email":   "info@mantraloktech.com",
    "pin":     "500076",
}
NEW = dict(CURRENT)   # change the values you want to update, then run

import glob, io
if NEW == CURRENT:
    print("Nothing to do — edit NEW first."); raise SystemExit(0)
count = 0
for path in sorted(glob.glob("*.html")):
    s = orig = io.open(path, encoding="utf-8").read()
    for k in CURRENT:
        if NEW[k] != CURRENT[k]:
            s = s.replace(CURRENT[k], NEW[k])
    if s != orig:
        io.open(path, "w", encoding="utf-8").write(s); print("updated", path); count += 1
print("\n%d files updated. Remember to update the LLP address block if it changed." % count)
