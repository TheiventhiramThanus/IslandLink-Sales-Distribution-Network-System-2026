import { jsPDF } from 'jspdf';
import fs from 'fs';

const content = fs.readFileSync('system_design.md', 'utf8');

const doc = new jsPDF();
doc.setFontSize(12);
const splitText = doc.splitTextToSize(content, 180);
doc.text(splitText, 10, 10);
doc.save('system_design.pdf');
console.log('PDF generated at system_design.pdf');
