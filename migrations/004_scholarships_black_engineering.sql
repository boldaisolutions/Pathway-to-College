delete from scholarships
where name = 'Chinese American Service League STEM Scholarship';

insert into scholarships (name, amount, deadline, tags, url)
select * from (values
  ('Rodney C. Adkins Academic Achievement Scholarship', 'Up to $10,000',    date '2026-05-15', array['Black/African American','Male','STEM','Engineering','High School Senior','Undergraduate'], 'https://bigfuture.collegeboard.org/scholarships'),
  ('Hubertus W. V. Willems Scholarship',                '$3,000',           date '2026-05-22', array['Male','Minority','Engineering','Chemistry','Physics','Mathematics','Need-based'],           'https://naacp.org'),
  ('Ron Brown Scholar Program',                         '$40,000 total',    date '2027-01-09', array['Black/African American','Any-major','High School Senior','Leadership'],                    'https://www.ronbrown.org'),
  ('Jackie Robinson Foundation Scholarship',            'Varies',           date '2027-01-05', array['Minority','High School Senior','Leadership','Need-based'],                                 'https://www.jackierobinson.org'),
  ('NSBE Jr. Golden Torch Scholarship',                 '$1,000',           null::date,        array['Black/African American','Engineering','STEM','High School Senior'],                        'https://nsbe.org/scholarships'),
  ('NSBE Jr. Graduating Senior Scholarship',            '$500',             null::date,        array['Black/African American','Engineering','STEM','High School Senior'],                        'https://nsbe.org/scholarships'),
  ('NSBE Jr. Fulfilling the Legacy Scholarship',        '$500',             null::date,        array['Black/African American','Engineering','STEM','High School Senior','Undergraduate'],         'https://nsbe.org/scholarships'),
  ('NSBE Scholarships',                                 '$500-$17,000+',    null::date,        array['Black/African American','Engineering','Computer Science','Mathematics','STEM'],            'https://nsbe.org/scholarships'),
  ('NACME Scholarships',                                'Typically $5,000', null::date,        array['Minority','Engineering','Computer Science','STEM','High School Senior','Undergraduate'],   'https://www.nacme.org/nacme-scholarships'),
  ('UNCF Scholarships',                                 'Varies',           null::date,        array['Black/African American','Any-major','Need-based'],                                         'https://uncf.org/scholarships'),
  ('CBC Spouses Essay Contest',                         'Varies',           null::date,        array['Black/African American','Essay','High School Junior','High School Senior'],                'https://www.cbcfinc.org'),
  ('Amazon Future Engineer Scholarship',                'Up to $40,000',    null::date,        array['Engineering','Computer Engineering','Computer Science','STEM','High School Senior'],       'https://www.amazonfutureengineer.com'),
  ('ACS Scholars Program',                              'Up to $5,000/year',date '2027-03-01', array['Minority','Chemistry','Chemical Engineering','STEM'],                                     'https://www.acs.org'),
  ('Regeneron Science Talent Search',                   '$2,000-$250,000',  date '2026-11-05', array['Research','Science','STEM','High School Senior'],                                          'https://www.societyforscience.org')
) as v(name, amount, deadline, tags, url)
where not exists (select 1 from scholarships s where s.name = v.name);
