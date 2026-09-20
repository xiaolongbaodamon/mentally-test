import { PTCCampusResource } from "../types";

export const COGNITIVE_DISTORTIONS = [
  {
    name: "All-or-Nothing Thinking",
    description: "Seeing situations in black-and-white extremes (e.g., 'If I don't get 1.00 on this project, I am an absolute failure').",
    example: "Getting an 85% and believing you are not suited for your college course.",
    reframingQuestion: "What is a realistic middle ground or gray area in this situation?",
  },
  {
    name: "Catastrophizing",
    description: "Expecting the worst possible outcome to happen without examining real probabilities.",
    example: "Thinking: 'I fumbled one question during defense, so my entire group will fail and not graduate.'",
    reframingQuestion: "What is the most likely realistic scenario instead of the worst possible?",
  },
  {
    name: "Overgeneralization",
    description: "Taking a single negative event as an endless pattern of defeat.",
    example: "Saying: 'I always fail coding exams' after one difficult midterm.",
    reframingQuestion: "Have there been times when you succeeded or learned from a setback?",
  },
  {
    name: "Mind Reading / Jumping to Conclusions",
    description: "Assuming you know what classmates or professors are thinking about you negatively.",
    example: "Assuming your professor didn't reply immediately because they dislike you.",
    reframingQuestion: "What objective evidence do I actually have for what they are thinking?",
  },
  {
    name: "Emotional Reasoning",
    description: "Believing that because you feel anxious or stupid, it must be objective reality.",
    example: "'I feel like an imposter, therefore I don't belong in college.'",
    reframingQuestion: "Can I acknowledge this feeling while recognizing that feelings are not facts?",
  },
  {
    name: "'Should' Statements",
    description: "Putting rigid, unreasonable expectations on yourself that foster guilt and frustration.",
    example: "'I should be able to study 8 hours without feeling exhausted.'",
    reframingQuestion: "What would happen if I substituted 'should' with 'I prefer' or 'I will try'?",
  },
];

export const PTC_RESOURCES: PTCCampusResource[] = [
  {
    id: "ptc-guidance",
    title: "Guidance and Counseling Center",
    department: "Student Affairs & Services Division",
    contactPerson: "Dr. Evelyn Ramirez, RGC (Head Guidance Counselor)",
    location: "2nd Floor, Academic Building 1, PTC Main Campus",
    email: "guidance@pateros.edu.ph",
    phone: "(02) 8642-1234 loc. 105",
    operatingHours: "Monday - Friday: 8:00 AM - 5:00 PM",
    services: [
      "Individual Psychological Counseling",
      "Academic Stress & Adjustment Support",
      "Career & Vocational Counseling",
      "Peer Facilitator Program",
      "Mental Health Referral Network",
    ],
    confidentialityNotice: "All sessions and records are treated with the highest standard of student privacy and confidentiality under RA 11036 (Mental Health Act).",
  },
  {
    id: "ptc-clinic",
    title: "PTC Medical and Dental Health Services",
    department: "Health Services Unit",
    contactPerson: "Dr. Roberto Santos, MD",
    location: "Ground Floor, Administration Building",
    email: "clinic@pateros.edu.ph",
    phone: "(02) 8642-1234 loc. 102",
    operatingHours: "Monday - Saturday: 7:30 AM - 5:30 PM",
    services: [
      "Immediate First Aid & Emergency Assessment",
      "Physical Health Screenings",
      "Medical Certificates for Absences",
      "Referral to Tertiary Hospitals & Clinics",
    ],
    confidentialityNotice: "Medical consultations are strictly private between the student and healthcare personnel.",
  },
  {
    id: "ptc-osa",
    title: "Office of Student Affairs (OSA)",
    department: "Student Leadership & Welfare",
    contactPerson: "Prof. Marian Del Rosario",
    location: "Ground Floor, Student Activity Pavilion",
    email: "studentaffairs@pateros.edu.ph",
    phone: "(02) 8642-1234 loc. 110",
    operatingHours: "Monday - Friday: 8:00 AM - 5:00 PM",
    services: [
      "Student Welfare & Grievance Assistance",
      "Scholarship & Financial Aid Guidance",
      "Student Organizations & Peer Support Clubs",
      "Safe Spaces & Anti-Bullying Help Desk",
    ],
    confidentialityNotice: "Student welfare concerns are resolved with impartiality and care.",
  },
];

export const PTC_CAMPUS_INFO = {
  institutionName: "Pateros Technological College",
  institution: "Pateros Technological College",
  institute: "PTC",
  address: "College St., Sto. Rosario-Kanluran, Pateros, Metro Manila, Philippines",
  website: "https://pateros.edu.ph",
  motto: "Excellence in Technology, Integrity in Service",
  emergencyProtocol: "In case of urgent medical or psychiatric distress on campus, proceed immediately to the Campus Clinic or notify campus security.",
};
