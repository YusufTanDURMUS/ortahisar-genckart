const fs = require('fs');
const path = require('path');

const firstNames = ['Ali', 'Veli', 'Ayşe', 'Fatma', 'Ahmet', 'Mehmet', 'Yusuf', 'Can', 'Zeynep', 'Elif', 'Murat', 'Kemal', 'Osman', 'Hakan', 'Serkan'];
const lastNames = ['Yılmaz', 'Çelik', 'Demir', 'Kaya', 'Şahin', 'Yıldız', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Çetin'];
const schools = ['Karadeniz Teknik Üniversitesi (KTÜ)', 'Trabzon Üniversitesi', 'Avrasya Üniversitesi', 'Ortahisar Lisesi'];
const categories = ['Kafe/Restoran', 'Market', 'Giyim', 'Teknoloji', 'Kırtasiye', 'Kuaför/Berber', 'Spor/Eğlence', 'Kozmetik'];
const neighborhoods = ['Kalkınma', 'İskenderpaşa', 'Üniversite', 'Boztepe', 'Çukurçayır', 'Pelitli', 'Yalıncak', 'Erdoğdu', 'Çarşı'];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPhone = () => '053' + Math.floor(10000000 + Math.random() * 90000000).toString();
const randomTC = () => Math.floor(10000000000 + Math.random() * 90000000000).toString();

let studentsCode = '';
for (let i = 10; i <= 30; i++) {
  studentsCode += `
  const studentUser${i} = await prisma.user.upsert({
    where: { email: 'ogr${i}@ogr.ktu.edu.tr' },
    update: {},
    create: {
      role: 'STUDENT',
      email: 'ogr${i}@ogr.ktu.edu.tr',
      phoneNumber: '${randomPhone()}',
      passwordHash: '$2a$10$yMCQcqvPiOD5YAYHy6cWc.omGq4aIqbvTZN2HjkzkHDZYcSdDKJBa',
    },
  });

  await prisma.studentProfile.upsert({
    where: { tcKn: '${randomTC()}' },
    update: {},
    create: {
      userId: studentUser${i}.id,
      tcKn: '${randomTC()}',
      firstName: '${random(firstNames)}',
      lastName: '${random(lastNames)}',
      birthYear: ${1998 + Math.floor(Math.random() * 8)},
      schoolName: '${random(schools)}',
      district: 'Ortahisar',
      isEligible: true,
      statusReason: 'ACTIVE',
      edevletRefCode: 'EDEVLET-REF-61${Math.floor(Math.random() * 10000)}',
    },
  });
`;
}

let merchantsCode = ',';
for(let i=10; i<=30; i++) {
  merchantsCode += `
    {
      businessName: '${random(firstNames)} ${random(categories).split('/')[0]}',
      category: '${random(categories)}',
      address: '${random(neighborhoods)} Mah. No:${Math.floor(Math.random()*100)} Ortahisar/Trabzon',
      taxNumber: '6100000${i.toString().padStart(3, '0')}',
      defaultDiscountRate: ${Math.floor(Math.random()*20) + 5}.0,
      email: 'esnaf${i}@gmail.com',
      phoneNumber: '${randomPhone()}',
      branches: [
        { title: 'Merkez Şube', address: '${random(neighborhoods)} Mah. No:${Math.floor(Math.random()*100)} Ortahisar/Trabzon', isMain: true }
      ]
    },`;
}

const seedPath = path.join(__dirname, 'seed.ts');
let seedContent = fs.readFileSync(seedPath, 'utf8');

// Insert students before "// 3. Örnek Esnaflar Listesi"
seedContent = seedContent.replace('  // 3. Örnek Esnaflar Listesi', studentsCode + '\n  // 3. Örnek Esnaflar Listesi');

// Insert merchants into esnaflarData array
seedContent = seedContent.replace('  ];\n\n  for (const item of esnaflarData) {', merchantsCode + '\n  ];\n\n  for (const item of esnaflarData) {');

fs.writeFileSync(seedPath, seedContent);
console.log('Successfully injected 21 students and 21 merchants into seed.ts');
