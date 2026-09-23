---
title: "Where AI actually helps in sheet-metal fabrication"
date: 2026-09-23
author: "Roald van Buuren"
kind: Field notes
summary: "A practical guide for fabricators and the software companies that serve them: quoting, setup, specifications and support, and where people should stay in charge."
subtitle: "A practical guide for fabricators and the software companies that serve them."
draft: true
---

###### Why this guide

## Most of the value is in the paperwork around the machine.

Sheet-metal fabrication has been automated for decades. Nesting software packs parts onto sheets, CAM generates the cutting paths, and modern lasers, punches and press brakes run with remarkable precision.

So when people ask where AI fits in a fabrication business, they often look at the machine first. In our experience that is the wrong place to start. The cutting itself is already optimised by specialised algorithms, and a language model will not beat them at their own job.

The real opportunity sits around the machine: in the emails, drawings, spreadsheets, support tickets and experience that turn a customer request into a finished part. That is where time disappears, where knowledge lives in a few people's heads, and where AI can take real load off the team.

This guide walks through that job from start to finish and marks where AI helps, where it needs a human next to it, and where it should stay out.

###### 01 / Quoting

## From request to quote

A typical request arrives as an email with a few attachments: drawings, 3D files, a quantity, a material, a deadline, and often some ambiguity. Someone has to read it, work out what is actually being asked, check it against what the shop can do, estimate material and machine time, and send a price.

**Where AI helps**

- Reading incoming requests and pulling out the essentials: part names, quantities, material, thickness, finish, deadline.
- Flagging what is missing or unclear before anyone spends time on it, and drafting the follow-up question to the customer.
- Finding similar jobs you have quoted or made before, with the price, the margin and what went wrong last time.
- Drafting the quote text and the covering email in the customer's language.

**Where people stay in charge**

- The price. AI can assemble the inputs and suggest a number based on history, but a person signs off on what the business commits to.
- Anything that depends on the relationship: a key account, a strategic job, a customer who always changes the drawing at the last minute.

###### 02 / Job preparation

## Setting up the job

Once a job is won, it has to be prepared: programs generated, material checked, parameters chosen, the job scheduled. A lot of this runs through CAM and nesting software already. What is often missing is the context around it.

**Where AI helps**

- Surfacing notes from previous runs of the same or similar parts: what setting worked, what caused rework, what the operator changed.
- Making specifications and customer requirements easy to find at the machine, instead of buried in a PDF on someone's desktop.
- Summarising a job's history for whoever picks it up on the next shift.

**Where people stay in charge**

- Machine parameters. Suggestions from history are useful as a starting point, but settings for cutting and bending must be validated by the people responsible for the process and the equipment.
- Anything touching safety.

###### 03 / On the shop floor

## Keeping know-how in the building

Every fabrication shop has a few experienced operators who just know: which material batch behaves differently, how to get a clean finish on a tricky part, why a job that looks simple will cause trouble. When they are on holiday or retire, that knowledge goes with them.

**Where AI helps**

- Capturing that knowledge in the flow of work: short notes, photos and fixes attached to parts and jobs, searchable later in plain language.
- Answering newer operators' questions from that shared memory, so experienced people answer the same question less often.
- Translating instructions and notes for multilingual teams.

**Where people stay in charge**

- Inspection and sign-off. Quality decisions stay with the people accountable for them.

###### 04 / For software companies

## If you build software for fabricators

CAD/CAM and nesting software vendors sit on something valuable: years of support tickets, documentation, release notes and the expertise of application engineers who have seen every edge case.

**Inside the company**, the same pattern applies. A support assistant that answers from past tickets and documentation, with sources, can shorten response times and help new support staff get productive faster. It also frees application engineers for the hard problems.

**Inside the product**, the opportunity is to bring that same knowledge to every customer: help that understands the user's context, smarter defaults based on how similar customers work, and assistance with the paperwork around the machine. Customers' drawings and process data are sensitive, so where the AI runs and what it is allowed to learn from matter as much as what it can do.

###### Summary

## Where AI fits

| Area | AI helps with | People stay in charge of |
|---|---|---|
| Quoting | Reading requests, finding similar past jobs, drafting quotes and follow-ups | The price and the customer relationship |
| Job preparation | Surfacing past notes, specs and job history | Machine parameters and safety |
| Shop floor | Capturing and sharing know-how, answering routine questions, translation | Inspection and quality sign-off |
| Support (software vendors) | Answering from tickets and docs, with sources | Complex cases and product decisions |
| Nesting and cutting paths | Little: specialised algorithms already do this well | The existing tools and the people who run them |

###### Where to start

## Start with one workflow

If you are a fabricator or a software company in this space, the practical first step is not a platform decision. Pick the one workflow that costs you the most time or the most repeated questions (quoting is often a good candidate), map how it really works today, and put AI into that one place properly.

> The goal is the same everywhere in the shop: less searching, retyping and chasing, so the people who know the work can spend their time on the work.
