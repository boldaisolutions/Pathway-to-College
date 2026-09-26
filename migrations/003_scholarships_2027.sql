-- =============================================================================
-- Migration 003 — Scholarship pool refresh (Class of 2027)
-- Broad pool: any-major + STEM/engineering/biomedical/health-tech/research.
-- Paste into the Supabase SQL editor and RUN. Idempotent (dedupes by name).
-- Non-destructive: existing scholarships stay; only clear rename-duplicates
-- with no saved applications are removed so cards don't double up.
-- =============================================================================

-- Remove superseded seed rows that this list renames (only if nobody saved them).
delete from scholarships s
where s.name in ('Coca-Cola Scholars', 'Gates Scholarship', 'Burger King Scholars', 'Elks MVS Scholarship')
  and not exists (select 1 from saved_scholarships ss where ss.scholarship_id = s.id);

insert into scholarships (name, amount, deadline, tags, url)
select * from (values
  ('Coca-Cola Scholars Program',                              '$20,000',                 date '2026-09-30', array['Leadership','National','Any-major'],        'https://www.coca-colascholarsfoundation.org'),
  ('The Gates Scholarship',                                   'Full cost of attendance', date '2026-09-15', array['Need-based','Minority','Any-major'],        'https://www.thegatesscholarship.org'),
  ('Jack Kent Cooke College Scholarship',                     'Up to $55,000/year',      date '2026-11-12', array['Need-based','Academic','Any-major'],       'https://www.jkcf.org'),
  ('Elks Most Valuable Student Scholarship',                  '$1,000–$7,500/year',      date '2026-11-12', array['Leadership','Need-based'],                 'https://www.elks.org/scholars'),
  ('Burger King Scholars',                                    '$1,000–$60,000',          date '2026-12-15', array['Service','National','Any-major'],          'https://www.bkmclamorefoundation.org'),
  ('BigFuture Scholarships',                                  'Up to $40,000',           date '2026-10-31', array['Any-major','National','Multi-step'],        'https://bigfuture.collegeboard.org/scholarships'),
  ('Science Ambassador Scholarship',                          '$20,000',                 date '2026-12-14', array['STEM','Women','Research'],                 'https://www.scienceambassadorscholarship.org'),
  ('FOSSI Scholarship',                                       '$40,000 total',           date '2027-01-15', array['STEM','Engineering','Chemistry'],          ''),
  ('AAMI Foundation Michael J. Miller HTM Scholarship',       '$3,000',                  date '2027-01-15', array['Biomedical','Health-tech'],               ''),
  ('AIAA Roger W. Kahn Scholarship',                          '$10,000',                 date '2027-01-10', array['Engineering','Aerospace','STEM'],          ''),
  ('Tau Beta Pi/SAE Engineering Scholarship',                 '$10,000',                 date '2027-02-28', array['Engineering','STEM'],                      ''),
  ('SAE Engineering Scholarships',                            'Up to $10,000',           date '2027-02-28', array['Engineering','STEM'],                      ''),
  ('SAE SmartMobility Evolution Scholarship',                 '$5,000',                  date '2027-02-28', array['Engineering','Technology'],                ''),
  ('SAE/Ford Partnership for Advanced Studies Scholarship',   '$10,000',                 date '2027-02-28', array['Engineering','STEM'],                      ''),
  ('RESPEC STEM Scholarship',                                 '$3,000',                  date '2027-02-28', array['STEM'],                                    ''),
  ('3M STEM Scholarship',                                     'Varies',                  date '2027-03-01', array['STEM','Technology'],                       ''),
  ('AWS Edward J. Brady Memorial Scholarship',                '$10,000',                 date '2027-03-01', array['Engineering','Trade'],                     ''),
  ('AWS James A. Turner Jr. Memorial Scholarship',            '$10,000',                 date '2027-03-01', array['Engineering','Trade'],                     ''),
  ('AWS John C. Lincoln Memorial Scholarship',                '$10,000',                 date '2027-03-01', array['Engineering','Trade'],                     ''),
  ('AWS William B. Howell Scholarship',                       '$10,000',                 date '2027-03-01', array['Engineering','Trade'],                     ''),
  ('ASHRAE High School Senior Scholarship',                   'Up to $3,000',            date '2027-05-01', array['Engineering','STEM'],                      ''),
  ('CodeWizardsHQ Educational Scholarship',                   '$2,500',                  date '2027-05-01', array['Technology','STEM'],                       ''),
  ('Chinese American Service League STEM Scholarship',        '$20,000',                 date '2027-04-01', array['STEM','Minority'],                         ''),
  ('Chicago Engineers'' Foundation Incentive Award',          '$6,000',                  date '2027-04-01', array['Engineering','Local'],                     ''),
  ('AFA Teen Alzheimer''s Awareness Scholarship',             '$5,000',                  date '2027-04-01', array['Essay','Health'],                          ''),
  ('ACF Woodcock Family Education Scholarship',               '$40,000',                 date '2027-04-01', array['Any-major'],                               ''),
  ('SVCF On Your Own Scholarship',                            '$16,000',                 date '2027-02-28', array['Need-based'],                              ''),
  ('SVCF Leo and Trinidad Sanchez Scholarship',              '$4,500',                  date '2027-02-28', array['Need-based','Local'],                      ''),
  ('The Rezvan Foundation for Excellence Scholarship',        '$100,000',                date '2027-02-28', array['Academic','Any-major'],                    ''),
  ('TheDream.US National Scholarship',                        'Up to $33,000',           date '2027-02-28', array['Need-based','Undocumented'],               ''),
  ('UMSA Foundation Scholarship',                             '$3,000',                  date '2027-02-28', array['Any-major'],                               ''),
  ('Willard G. Plentl Sr. Aviation Scholarship',             '$12,000',                 date '2027-02-28', array['Aviation','Engineering'],                  ''),
  ('Women in Construction Scholarship',                       '$2,000',                  date '2027-02-28', array['Women','Engineering','Trade'],             ''),
  ('AFSA National High School Essay Contest',                 '$2,500',                  date '2027-03-01', array['Essay'],                                   ''),
  ('Zonta Young Women in Public Affairs Award',               '$5,000',                  date '2027-03-22', array['Women','Public-affairs','Leadership'],     ''),
  ('Zeta Phi Beta EPZ Academic Scholarship',                  '$1,000',                  date '2026-12-31', array['Academic'],                                ''),
  ('5 Strong Scholarship Foundation',                         'Full tuition',            date '2026-12-31', array['Need-based'],                              ''),
  ('My Story Matters Scholarship',                            '$1,000',                  date '2026-09-25', array['Essay'],                                   ''),
  ('VBKA College Scholarship Program',                        '$3,000',                  date '2026-09-25', array['Any-major','Local'],                       ''),
  ('Ethical Torch Essay Scholarship',                         '$1,500',                  date '2026-09-27', array['Essay'],                                   ''),
  ('$2,000 No Essay Scholarship by Sallie',                   '$2,000',                  date '2026-09-30', array['No-essay','Any-major'],                    ''),
  ('$25,000 Be Bold No-Essay Scholarship',                    '$25,000',                 date '2026-09-30', array['No-essay','Any-major'],                    ''),
  ('Acorn Equality Fund Scholarships',                        '$4,000',                  date '2026-09-25', array['LGBTQ','Local'],                           ''),
  ('ACF Davis-Kozoll Scholarship',                            '$5,000',                  date '2027-04-01', array['Any-major'],                               ''),
  ('ACF James Ledwith Memorial Scholarship',                  '$2,000',                  date '2027-04-01', array['Any-major'],                               ''),
  ('ACF Kiwanis Club of Albuquerque Scholarship',             '$1,000',                  date '2027-04-01', array['Local','Any-major'],                       '')
) as v(name, amount, deadline, tags, url)
where not exists (select 1 from scholarships s where s.name = v.name);
