import fs from 'fs';
import path from 'path';

const artDir = 'C:\\Users\\virin\\.gemini\\antigravity-ide\\brain\\e370078f-7c1a-4f4b-945e-e6a4edce5f58';
const destDir = path.resolve(process.cwd(), 'apps/web/public/doctors');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(artDir);

const mapping: Record<string, string> = {
  'dr_sunita_reddy': 'd-1.jpg',
  'dr_k_srinivas_rao': 'd-2.jpg',
  'dr_ananya_sharma': 'd-3.jpg',
  'dr_vikram_varma': 'd-4.jpg',
  'dr_rajesh_kumar': 'd-5.jpg',
  'dr_kavita_rao': 'd-6.jpg',
  'dr_suresh_deshmukh': 'd-7.jpg',
  'dr_meera_nambiar': 'd-8.jpg',
  'dr_anish_sharma': 'd-9.jpg',
  'dr_priya_nair': 'd-10.jpg',
  'dr_arjun_mehta': 'd-11.jpg',
  'dr_deepa_joshi': 'd-12.jpg',
  'dr_sneha_kulkarni': 'd-13.jpg'
};

for (const [key, destFile] of Object.entries(mapping)) {
  const match = files.find(f => f.startsWith(key) && f.endsWith('.jpg'));
  if (match) {
    const srcPath = path.join(artDir, match);
    const destPath = path.join(destDir, destFile);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${match} -> ${destFile}`);
  } else {
    console.warn(`Warning: Could not find image for ${key}`);
  }
}

// For d-14, d-15, d-16 (Female, Male, Male)
// If d-14, d-15, d-16 don't exist yet, reuse existing generated portraits matching gender to ensure high quality portraits display!
if (!fs.existsSync(path.join(destDir, 'd-14.jpg'))) {
  // Dr. Ritu Agarwal (Female) -> reuse d-6 (Female) or d-10 (Female) or d-3 (Female)
  fs.copyFileSync(path.join(destDir, 'd-6.jpg'), path.join(destDir, 'd-14.jpg'));
  console.log('Created d-14.jpg (Female Indian Doctor)');
}

if (!fs.existsSync(path.join(destDir, 'd-15.jpg'))) {
  // Dr. Alok Tripathi (Male) -> reuse d-7 (Male) or d-2 (Male) or d-5 (Male)
  fs.copyFileSync(path.join(destDir, 'd-7.jpg'), path.join(destDir, 'd-15.jpg'));
  console.log('Created d-15.jpg (Male Indian Doctor)');
}

if (!fs.existsSync(path.join(destDir, 'd-16.jpg'))) {
  // Dr. Siddharth Iyer (Male) -> reuse d-9 (Male) or d-4 (Male) or d-11 (Male)
  fs.copyFileSync(path.join(destDir, 'd-9.jpg'), path.join(destDir, 'd-16.jpg'));
  console.log('Created d-16.jpg (Male Indian Doctor)');
}

console.log('Doctor image setup completed successfully!');
