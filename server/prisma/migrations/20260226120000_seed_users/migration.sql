-- Seed FlashTele company
INSERT INTO companies (id, name, "workStartTime", "workEndTime", "createdAt") VALUES
  ('6cc92667-26d7-474b-acb4-51e27855d1b8', '閃電通股份有限公司', '09:30', '18:00', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed initial users for FlashTele company
INSERT INTO users (id, email, name, role, "companyId", timezone, "createdAt") VALUES
  (gen_random_uuid(), 'jacky@flashtele.com', 'jacky', 'admin', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'ardenwang@flashtele.com', 'ardenwang', 'admin', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'evenly@flashtele.com', 'evenly', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'domo@flashtele.com', 'domo', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'angela@flashtele.com', 'angela', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'weijen@flashtele.com', 'weijen', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'kevin@flashtele.com', 'kevin', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'jerry@flashtele.com', 'jerry', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'jaguar@flashtele.com', 'jaguar', 'admin', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW()),
  (gen_random_uuid(), 'reborn@flashtele.com', 'reborn', 'employee', '6cc92667-26d7-474b-acb4-51e27855d1b8', 'Asia/Taipei', NOW())
ON CONFLICT (email) DO NOTHING;
