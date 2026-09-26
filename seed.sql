-- =============================================================================
-- Pathway to College — seed data for the shared catalogs.
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT-free inserts guarded
-- by NOT EXISTS on name). These tables are world-readable to authenticated
-- users; writes here should be done with the service-role key.
-- =============================================================================

-- ---------- Scholarships ------------------------------------------------------
insert into scholarships (name, amount, deadline, tags, url)
select * from (values
  ('Coca-Cola Scholars',      '$20,000',     date '2026-10-31', array['Leadership','National'],   'https://www.coca-colascholarsfoundation.org'),
  ('Regeneron STEM',          '$5,000',      date '2026-11-01', array['Research','STEM'],          'https://www.societyforscience.org'),
  ('Gates Scholarship',       'Full ride',   date '2026-09-15', array['Need-based','STEM'],        'https://www.thegatesscholarship.org'),
  ('Burger King Scholars',    '$1k-$50k',    date '2026-12-15', array['Service','National'],       'https://www.bkmclamorefoundation.org'),
  ('AXA Achievement',         '$10,000',     date '2026-12-15', array['Achievement'],              ''),
  ('Rotary STEM Award',       '$2,500',      date '2027-03-01', array['Local','STEM'],             ''),
  ('Elks MVS Scholarship',    '$1k-$50k',    date '2026-11-15', array['Leadership','Need-based'],  'https://www.elks.org/scholars'),
  ('Davidson Fellows',        '$10k-$50k',   date '2027-02-12', array['Research','STEM'],          'https://www.davidsongifted.org'),
  ('Prudential Emerging Visionaries','$5k-$15k', date '2026-11-04', array['Service','Leadership'], ''),
  ('Horatio Alger',           '$25,000',     date '2026-10-25', array['Need-based','Adversity'],   'https://scholars.horatioalger.org'),
  ('National Merit (PSAT)',   'Varies',      date '2026-10-15', array['Academic','National'],      ''),
  ('GE-Reagan Foundation',    '$10,000',     date '2027-01-04', array['Leadership','Service'],     '')
) as v(name, amount, deadline, tags, url)
where not exists (select 1 from scholarships s where s.name = v.name);

-- ---------- Colleges ----------------------------------------------------------
insert into colleges (name, abbr, location, acceptance_rate)
select * from (values
  ('Massachusetts Institute of Technology', 'MIT', 'Cambridge, MA',        '4%'),
  ('Carnegie Mellon University',            'CMU', 'Pittsburgh, PA',       '11%'),
  ('University of California, Berkeley',     'UCB', 'Berkeley, CA',        '11%'),
  ('Georgia Institute of Technology',       'GT',  'Atlanta, GA',         '16%'),
  ('University of Washington',              'UW',  'Seattle, WA',         '48%'),
  ('Purdue University',                     'PUR', 'West Lafayette, IN',  '53%'),
  ('University of Massachusetts Amherst',   'UMA', 'Amherst, MA',         '58%'),
  ('Stanford University',                   'STAN','Stanford, CA',         '4%'),
  ('University of Illinois Urbana-Champaign','UIUC','Champaign, IL',       '45%'),
  ('University of Michigan',                'UMICH','Ann Arbor, MI',       '18%'),
  ('University of Texas at Austin',         'UT',  'Austin, TX',          '31%'),
  ('Cornell University',                    'COR', 'Ithaca, NY',          '7%')
) as v(name, abbr, location, acceptance_rate)
where not exists (select 1 from colleges c where c.name = v.name);

-- ---------- Colleges (expanded catalog) --------------------------------------
insert into colleges (name, abbr, location, acceptance_rate)
select * from (values
  ('Harvard University','HARV','Cambridge, MA','3%'),
  ('Yale University','YALE','New Haven, CT','5%'),
  ('Princeton University','PRIN','Princeton, NJ','4%'),
  ('Columbia University','COLU','New York, NY','4%'),
  ('Brown University','BROWN','Providence, RI','5%'),
  ('Dartmouth College','DART','Hanover, NH','6%'),
  ('University of Pennsylvania','PENN','Philadelphia, PA','6%'),
  ('California Institute of Technology','CALT','Pasadena, CA','3%'),
  ('Duke University','DUKE','Durham, NC','6%'),
  ('Northwestern University','NW','Evanston, IL','7%'),
  ('Johns Hopkins University','JHU','Baltimore, MD','7%'),
  ('Vanderbilt University','VAND','Nashville, TN','7%'),
  ('Rice University','RICE','Houston, TX','8%'),
  ('University of Notre Dame','ND','Notre Dame, IN','12%'),
  ('Emory University','EMRY','Atlanta, GA','13%'),
  ('Washington University in St. Louis','WUSTL','St. Louis, MO','12%'),
  ('Georgetown University','GTWN','Washington, DC','12%'),
  ('University of Southern California','USC','Los Angeles, CA','12%'),
  ('New York University','NYU','New York, NY','12%'),
  ('University of California, Los Angeles','UCLA','Los Angeles, CA','9%'),
  ('University of Virginia','UVA','Charlottesville, VA','19%'),
  ('University of North Carolina at Chapel Hill','UNC','Chapel Hill, NC','17%'),
  ('Tufts University','TUFTS','Medford, MA','10%'),
  ('Boston College','BC','Chestnut Hill, MA','15%'),
  ('Boston University','BU','Boston, MA','14%'),
  ('Northeastern University','NEU','Boston, MA','6%'),
  ('Wake Forest University','WFU','Winston-Salem, NC','21%'),
  ('University of California, San Diego','UCSD','La Jolla, CA','24%'),
  ('University of California, Irvine','UCI','Irvine, CA','21%'),
  ('University of California, Davis','UCD','Davis, CA','37%'),
  ('University of Florida','UF','Gainesville, FL','23%'),
  ('University of Wisconsin-Madison','UWM','Madison, WI','49%'),
  ('The Ohio State University','OSU','Columbus, OH','53%'),
  ('Pennsylvania State University','PSU','University Park, PA','55%'),
  ('University of Maryland','UMD','College Park, MD','45%'),
  ('Rutgers University','RUT','New Brunswick, NJ','66%'),
  ('Michigan State University','MSU','East Lansing, MI','83%'),
  ('University of Minnesota','UMN','Minneapolis, MN','75%'),
  ('Indiana University Bloomington','IU','Bloomington, IN','80%'),
  ('University of Arizona','UARIZ','Tucson, AZ','87%'),
  ('Arizona State University','ASU','Tempe, AZ','88%'),
  ('University of Colorado Boulder','CUB','Boulder, CO','80%'),
  ('University of Oregon','UO','Eugene, OR','82%'),
  ('San Diego State University','SDSU','San Diego, CA','34%'),
  ('Virginia Tech','VT','Blacksburg, VA','56%'),
  ('University of Pittsburgh','PITT','Pittsburgh, PA','49%')
) as v(name, abbr, location, acceptance_rate)
where not exists (select 1 from colleges c where c.name = v.name);

-- =============================================================================
-- OPTIONAL: per-student starter content (roadmap, deadlines) you may want to
-- generate at signup instead of seeding globally. Below is an example you can
-- adapt inside an Edge Function after a student completes onboarding.
-- Replace :student_id with the new student's uuid.
-- =============================================================================
-- insert into roadmap_milestones (student_id, grade, term, title, detail, status, position) values
--   (:student_id, 9,  'Year',   'Build strong GPA habits',        'Honors track foundation',          'done',  0),
--   (:student_id, 10, 'Fall',   'Take the PSAT',                  'Establish a testing baseline',     'doing', 0),
--   (:student_id, 10, 'Summer', 'Research or summer program',     'Apply to 3 — highest priority',    'todo',  1),
--   (:student_id, 11, 'Fall',   'AP courses in your major',       'Raise course rigor',               'todo',  0),
--   (:student_id, 12, 'Fall',   'Submit applications',            'EA/ED + balanced list',            'todo',  0);
