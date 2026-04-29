import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding…");

  // Wipe existing — safe for dev
  await prisma.$transaction([
    prisma.activity.deleteMany(),
    prisma.message.deleteMany(),
    prisma.task.deleteMany(),
    prisma.eventPartner.deleteMany(),
    prisma.eventHub.deleteMany(),
    prisma.programStartup.deleteMany(),
    prisma.programHub.deleteMany(),
    prisma.programMetric.deleteMany(),
    prisma.partnershipFunding.deleteMany(),
    prisma.partnershipProgram.deleteMany(),
    prisma.fundingDisbursement.deleteMany(),
    prisma.partnerContact.deleteMany(),
    prisma.event.deleteMany(),
    prisma.fundingSource.deleteMany(),
    prisma.partnership.deleteMany(),
    prisma.partner.deleteMany(),
    prisma.startup.deleteMany(),
    prisma.hubPayment.deleteMany(),
    prisma.hub.deleteMany(),
    prisma.program.deleteMany(),
    prisma.campaign.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.job.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.africonnectSyncLog.deleteMany(),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Departments
  const departments = [
    ["COO", "Office of COO"], ["ED", "Office of ED"], ["TECH", "Tech"],
    ["PROGRAMS", "Programs"], ["PARTNERSHIPS", "Partnerships"], ["EVENTS", "Events (AAG)"],
    ["MEMBERS", "Member Services"], ["PROCUREMENT", "Procurement & Operations"],
    ["COMMS", "Communications / PR"], ["FINANCE", "Finance"], ["AUDIT", "Audit & Compliance"], ["HR", "HR"],
  ];
  for (const [code, name] of departments) await prisma.department.create({ data: { code, name } });

  // Users
  const hash = (pw: string) => bcrypt.hash(pw, 10);
  const users = await Promise.all([
    prisma.user.create({ data: { email: "admin@afrilabs.test", name: "Ada Admin", passwordHash: await hash("admin1234"), role: "SUPER_ADMIN" } }),
    prisma.user.create({ data: { email: "coo@afrilabs.test", name: "Chioma Okafor", passwordHash: await hash("coo1234"), role: "COO", department: "COO" } }),
    prisma.user.create({ data: { email: "ed@afrilabs.test", name: "Ekow Mensah", passwordHash: await hash("ed1234"), role: "ED", department: "ED" } }),
    prisma.user.create({ data: { email: "partnerships@afrilabs.test", name: "Aisha Bello", passwordHash: await hash("p1234"), role: "DEPT_HEAD", department: "PARTNERSHIPS" } }),
    prisma.user.create({ data: { email: "programs@afrilabs.test", name: "Tunde Adebayo", passwordHash: await hash("pr1234"), role: "DEPT_HEAD", department: "PROGRAMS" } }),
    prisma.user.create({ data: { email: "members@afrilabs.test", name: "Linda Mwangi", passwordHash: await hash("m1234"), role: "DEPT_HEAD", department: "MEMBERS" } }),
    prisma.user.create({ data: { email: "events@afrilabs.test", name: "Karim Hassan", passwordHash: await hash("e1234"), role: "DEPT_HEAD", department: "EVENTS" } }),
  ]);
  const [admin, coo, ed, partnershipsLead, programsLead, membersLead] = users;

  // Hubs — 30 across all regions
  const HUB_DATA: Array<[string, string, string, string?, string?]> = [
    // West Africa
    ["CcHub", "Nigeria", "West Africa", "Lagos", "Tech"],
    ["iSpace", "Ghana", "West Africa", "Accra", "Tech"],
    ["MEST Africa", "Ghana", "West Africa", "Accra", "Software"],
    ["Impact Hub Lagos", "Nigeria", "West Africa", "Lagos", "Multi-sector"],
    ["Sahel Innovation Lab", "Senegal", "West Africa", "Dakar", "Agritech"],
    ["Innovation Village", "Côte d'Ivoire", "West Africa", "Abidjan", "Fintech"],
    // East Africa
    ["iHub", "Kenya", "East Africa", "Nairobi", "Tech"],
    ["Nailab", "Kenya", "East Africa", "Nairobi", "Software"],
    ["Hive Colab", "Uganda", "East Africa", "Kampala", "Multi-sector"],
    ["KINU", "Tanzania", "East Africa", "Dar es Salaam", "Tech"],
    ["RLabs Rwanda", "Rwanda", "East Africa", "Kigali", "Social"],
    ["iceaddis", "Ethiopia", "East Africa", "Addis Ababa", "Software"],
    // Southern Africa
    ["Workshop17", "South Africa", "Southern Africa", "Cape Town", "Multi-sector"],
    ["mLab Southern Africa", "South Africa", "Southern Africa", "Pretoria", "Mobile"],
    ["BongoHive", "Zambia", "Southern Africa", "Lusaka", "Tech"],
    ["Hypercube Hub", "Zimbabwe", "Southern Africa", "Harare", "Tech"],
    ["Innovate Namibia", "Namibia", "Southern Africa", "Windhoek", "Multi-sector"],
    ["SmartXchange", "South Africa", "Southern Africa", "Durban", "ICT"],
    // North Africa
    ["Flat6Labs", "Egypt", "North Africa", "Cairo", "Multi-sector"],
    ["AlexHub", "Egypt", "North Africa", "Alexandria", "Tech"],
    ["Maroc Numeric Cluster", "Morocco", "North Africa", "Casablanca", "ICT"],
    ["Tunisia Startups", "Tunisia", "North Africa", "Tunis", "Multi-sector"],
    ["Algeria Venture", "Algeria", "North Africa", "Algiers", "Tech"],
    // Central Africa
    ["ActivSpaces", "Cameroon", "Central Africa", "Buea", "Tech"],
    ["Ongola Fab Lab", "Cameroon", "Central Africa", "Yaoundé", "Hardware"],
    ["Kinshasa Digital", "DR Congo", "Central Africa", "Kinshasa", "Multi-sector"],
    ["Brazzaville Tech", "Republic of Congo", "Central Africa", "Brazzaville", "Tech"],
    ["Gabon Innov", "Gabon", "Central Africa", "Libreville", "Multi-sector"],
    ["CAR Hub", "Central African Republic", "Central Africa", "Bangui", "Multi-sector"],
    ["Chad Innovation", "Chad", "Central Africa", "N'Djamena", "Multi-sector"],
  ];

  const hubs = [];
  for (let i = 0; i < HUB_DATA.length; i++) {
    const [name, country, region, city, sector] = HUB_DATA[i];
    const tier = i % 7 === 0 ? "STRATEGIC" : i % 3 === 0 ? "PREMIUM" : "STANDARD";
    const status = i % 11 === 0 ? "PENDING" : i % 13 === 0 ? "SUSPENDED" : "ACTIVE";
    const engagement = 30 + ((i * 7) % 65);
    const h = await prisma.hub.create({
      data: {
        name, country, region, city: city ?? null, sector: sector ?? null,
        membershipTier: tier, status, engagementScore: engagement,
        africonnectId: `AC-${1000 + i}`,
        foundedYear: 2010 + (i % 12),
      },
    });
    hubs.push(h);

    // payments — varied
    const tierAmt = tier === "STRATEGIC" ? 5000 : tier === "PREMIUM" ? 1500 : 500;
    const now = new Date();
    if (i % 4 !== 0) {
      const start = new Date(now); start.setMonth(start.getMonth() - 6);
      const end = new Date(now);   end.setMonth(end.getMonth() + 6);
      await prisma.hubPayment.create({
        data: {
          hubId: h.id, amount: tierAmt, status: "PAID",
          periodStart: start, periodEnd: end, paidAt: start, reference: `INV-${2400 + i}`,
        },
      });
    } else if (i % 8 === 0) {
      const start = new Date(now); start.setMonth(start.getMonth() - 14);
      const end = new Date(now);   end.setMonth(end.getMonth() - 2);
      await prisma.hubPayment.create({
        data: { hubId: h.id, amount: tierAmt, status: "EXPIRED", periodStart: start, periodEnd: end, paidAt: start },
      });
    } else {
      await prisma.hubPayment.create({
        data: {
          hubId: h.id, amount: tierAmt, status: i % 2 ? "OVERDUE" : "PENDING",
          periodStart: new Date(now), periodEnd: new Date(now.getTime() + 1000*60*60*24*180),
        },
      });
    }
  }

  // Partners
  const PARTNERS: Array<[string, string, string?, string?, string?]> = [
    ["Mastercard Foundation", "FOUNDATION", "Canada", "North America", "Inclusive growth"],
    ["African Development Bank", "GOVERNMENT", "Côte d'Ivoire", "West Africa", "Development finance"],
    ["Google for Startups", "CORPORATE", "United States", "North America", "Tech"],
    ["GIZ", "GOVERNMENT", "Germany", "Europe", "Development cooperation"],
    ["IFC", "INVESTOR", "United States", "North America", "Investment"],
    ["Microsoft Africa", "CORPORATE", "South Africa", "Southern Africa", "Tech"],
    ["MTN Foundation", "FOUNDATION", "South Africa", "Southern Africa", "Telecom"],
    ["UNDP", "NGO", "United States", "Global", "Development"],
  ];
  const partners = [];
  for (const [name, type, country, region, sector] of PARTNERS) {
    partners.push(await prisma.partner.create({
      data: { name, type, country: country ?? null, region: region ?? null, sector: sector ?? null,
        email: `partnerships@${name.toLowerCase().replace(/[^a-z]/g,"")}.org`,
        website: `https://${name.toLowerCase().replace(/[^a-z]/g,"")}.org` },
    }));
  }

  // Programs
  const PROGRAMS: Array<[string, string, string, string, string, number, string]> = [
    ["Catalytic Africa", "CATALYTIC", "ECOSYSTEM_PROJECT", "ACTIVE", "Pan-African match-funding for early-stage startups.", 5_000_000, "Pan-African"],
    ["Afrilabs Accelerator", "AFRI-ACC-26", "ACCELERATOR", "ACTIVE", "Continental cohort for growth-stage African startups.", 2_500_000, "Pan-African"],
    ["Hub Capacity Building", "HCB-2026", "INITIATIVE", "ACTIVE", "Operational capacity programme for member hubs.", 800_000, "East Africa"],
    ["AAG 2026 Programme", "AAG-2026", "INITIATIVE", "ACTIVE", "The Africa Annual Gathering programme strand.", 1_200_000, "West Africa"],
    ["Ecosystem Insights", "INSIGHTS", "RESEARCH", "DRAFT", "Continent-wide research and reporting.", 350_000, "Pan-African"],
  ];
  const programs = [];
  for (const [name, code, type, status, description, budget, region] of PROGRAMS) {
    const lead = code === "CATALYTIC" ? programsLead : programsLead;
    const p = await prisma.program.create({
      data: {
        name, code, type, status, description, budget,
        region: region === "Pan-African" ? null : region,
        leadId: lead.id,
        startDate: new Date(2026, 0, 15),
      },
    });
    programs.push(p);
  }

  // Cohort hubs (link some hubs to programs)
  for (let i = 0; i < hubs.length; i++) {
    const program = programs[i % programs.length];
    await prisma.programHub.create({ data: { programId: program.id, hubId: hubs[i].id, role: i % 3 === 0 ? "HOST" : "COHORT_HUB" } }).catch(()=>{});
  }

  // Partnerships
  const STAGES = ["PROSPECT","ENGAGED","NEGOTIATION","ACTIVE","DORMANT"];
  const partnerships = [];
  for (let i = 0; i < partners.length; i++) {
    const stage = STAGES[i % STAGES.length];
    const pship = await prisma.partnership.create({
      data: {
        partnerId: partners[i].id, ownerId: partnershipsLead.id,
        title: `${partners[i].name} — engagement`, stage,
        value: 50_000 + i * 75_000, currency: "USD", source: i % 2 ? "INBOUND" : "OUTBOUND",
        notes: `Initial conversation around ${partners[i].sector ?? "ecosystem support"}.`,
      },
    });
    partnerships.push(pship);
    // link to a program
    const program = programs[i % programs.length];
    await prisma.partnershipProgram.create({
      data: { partnershipId: pship.id, programId: program.id, role: i % 2 ? "SPONSOR" : "FUNDER" },
    });
  }

  // Funding sources
  const fundingTypes = ["GRANT","INVESTMENT","SPONSORSHIP"];
  const fundingStatus = ["PLEDGED","APPROVED","DISBURSED","COMPLETED"];
  const fundingSources = [];
  for (let i = 0; i < 10; i++) {
    const partner = partners[i % partners.length];
    const program = programs[i % programs.length];
    const f = await prisma.fundingSource.create({
      data: {
        name: `${partner.name} — ${fundingTypes[i % 3]} ${i+1}`,
        type: fundingTypes[i % 3],
        amount: 100_000 + i * 150_000,
        status: fundingStatus[i % fundingStatus.length],
        partnerId: partner.id, programId: program.id,
        pledgeDate: new Date(2026, (i % 12), 5),
      },
    });
    fundingSources.push(f);
  }

  // Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: "Africa Annual Gathering 2026", type: "AAG", status: "PROMOTION",
        startDate: new Date(2026, 9, 15), endDate: new Date(2026, 9, 17),
        location: "Eko Hotel", city: "Lagos", country: "Nigeria",
        capacity: 1500, registered: 820, attended: 0,
        programId: programs.find(p => p.code === "AAG-2026")?.id ?? null,
        description: "The flagship annual ecosystem gathering.",
      },
    }),
    prisma.event.create({
      data: {
        name: "Catalytic Africa Demo Day", type: "PROGRAM_EVENT", status: "PLANNING",
        startDate: new Date(2026, 5, 22),
        location: "Online", city: null, country: null,
        registered: 200, attended: 0,
        programId: programs.find(p => p.code === "CATALYTIC")?.id ?? null,
      },
    }),
    prisma.event.create({
      data: {
        name: "Hub Capacity Workshop — Nairobi", type: "WORKSHOP", status: "EXECUTION",
        startDate: new Date(2026, 4, 10),
        location: "iHub", city: "Nairobi", country: "Kenya",
        registered: 80, attended: 65,
        programId: programs.find(p => p.code === "HCB-2026")?.id ?? null,
      },
    }),
  ]);

  // Tasks
  const TASKS = [
    ["Confirm venue contract", "EVENTS", "DONE"],
    ["Send sponsor decks", "PARTNERSHIPS", "IN_PROGRESS"],
    ["Open registration page", "TECH", "DONE"],
    ["Press release draft", "COMMS", "TODO"],
    ["Travel bookings for speakers", "PROCUREMENT", "TODO"],
    ["Finance reconciliation", "FINANCE", "BLOCKED"],
  ];
  for (const [title, dept, status] of TASKS) {
    await prisma.task.create({
      data: { title, department: dept, status, eventId: events[0].id, priority: "HIGH" },
    });
  }

  // Event partners
  for (let i = 0; i < 4; i++) {
    await prisma.eventPartner.create({
      data: { eventId: events[0].id, partnershipId: partnerships[i].id, role: i % 2 ? "SPONSOR" : "EXHIBITOR" },
    });
  }
  // Event hubs
  for (let i = 0; i < 6; i++) {
    await prisma.eventHub.create({ data: { eventId: events[0].id, hubId: hubs[i].id } });
  }

  // Campaigns
  await prisma.campaign.create({ data: {
    name: "AAG 2026 — registration open", channel: "EMAIL", audience: "ALL_HUBS", status: "SENT",
    subject: "Registration is now open for AAG 2026",
    body: "Dear hub leader, registration for the Africa Annual Gathering 2026 is now open…",
    recipients: hubs.length, opens: Math.round(hubs.length * 0.42), clicks: Math.round(hubs.length * 0.18),
    sentAt: new Date(),
    createdById: membersLead.id,
  }});
  await prisma.campaign.create({ data: {
    name: "Premium hub roundtable invite", channel: "EMAIL", audience: "TIER:PREMIUM", status: "SCHEDULED",
    subject: "You're invited: Premium roundtable", body: "An exclusive invitation…",
    recipients: hubs.filter(h=>h.membershipTier==="PREMIUM").length,
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
    createdById: membersLead.id,
  }});
  await prisma.campaign.create({ data: {
    name: "West Africa funding bulletin", channel: "AFRICONNECT", audience: "REGION:West Africa", status: "DRAFT",
    body: "New funding windows for West African hubs…", recipients: 0, createdById: membersLead.id,
  }});

  // Activities — organic feed
  await prisma.activity.create({ data: { type: "PROGRAM_LAUNCHED", title: "Catalytic Africa launched", body: "Match-funding programme is live.", programId: programs[0].id, userId: programsLead.id }});
  await prisma.activity.create({ data: { type: "PARTNERSHIP_CREATED", title: "Mastercard Foundation in negotiation", body: "Round 2 conversations scheduled.", partnershipId: partnerships[2].id, userId: partnershipsLead.id }});
  await prisma.activity.create({ data: { type: "FUNDING_PLEDGED", title: "$1.5M pledged by IFC", programId: programs[1].id, userId: ed.id }});
  await prisma.activity.create({ data: { type: "EVENT_UPDATED", title: "AAG 2026 registrations exceed 800", eventId: events[0].id, userId: users[6].id }});
  await prisma.activity.create({ data: { type: "HUB_PAID", title: `${hubs[0].name} renewed STRATEGIC tier`, hubId: hubs[0].id, userId: membersLead.id }});

  // Bookings
  await prisma.booking.create({ data: { type: "VENUE", vendor: "Eko Hotel", reference: "EKO-2026-001", cost: 45000, status: "CONFIRMED", startDate: new Date(2026, 9, 15) } });
  await prisma.booking.create({ data: { type: "FLIGHT", vendor: "Ethiopian Airlines", reference: "PNR-AB12CD", cost: 1200, status: "CONFIRMED" } });
  await prisma.booking.create({ data: { type: "HOTEL", vendor: "Radisson Blu Lagos", cost: 8000, status: "REQUESTED" } });

  // Jobs
  await prisma.job.create({ data: { title: "Programs Manager", organization: "Afrilabs", location: "Lagos", type: "FULL_TIME", sector: "Operations" } });
  await prisma.job.create({ data: { title: "Frontend Engineer", organization: "iHub", location: "Nairobi", type: "FULL_TIME", sector: "Tech" } });
  await prisma.job.create({ data: { title: "Community Lead", organization: "CcHub", location: "Lagos", type: "CONTRACT", sector: "Community" } });

  // Audit log
  await prisma.auditLog.create({ data: { action: "LOGIN", entity: "User", actorEmail: admin.email, entityId: admin.id }});
  await prisma.auditLog.create({ data: { action: "CREATE", entity: "Program", actorEmail: programsLead.email, entityId: programs[0].id }});
  await prisma.auditLog.create({ data: { action: "SYNC", entity: "Hub", entityId: null, actorEmail: "africonnect@system" }});

  console.log(`✓ Seeded: ${hubs.length} hubs, ${partners.length} partners, ${programs.length} programs, ${events.length} events`);
  console.log(`  Login: admin@afrilabs.test / admin1234`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
