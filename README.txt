QUARTIERE static website

Vercel:
- Framework Preset: Other
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty

Pages:
- /                      Home
- /what-we-do/           The Q4 Method
- /industries/           Five focus sectors
- /q4-labs/              Systems overview
- /q4-labs/vigil/        Company brain
- /q4-labs/polysoma/     Decision simulation
- /q4-labs/altiera/      Private language model
- /q4-labs/lumen/        Audience intelligence
- /insights/             Articles (placeholders until published)
- /trust/                Data handling
- /company/
- /contact/              Enquiry form

Shared styles: assets/quartiere-nav.css (nav, incl. mobile menu), assets/site-footer.css,
assets/product.css (product, Trust and Insights pages, loaded after q4-labs.css).

Forms (home modal and /contact/) do not send anywhere yet: they only show a
confirmation message. Connect a form service before going live.
