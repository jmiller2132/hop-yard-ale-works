import { locationSchema } from "./location";
import { menuItemSchema } from "./menuItem";
import { employeePickSchema } from "./employeePick";
import { eventSchema } from "./event";
import { taproomPhotoSchema } from "./taproomPhoto";
import { seasonalThemeSchema } from "./seasonalTheme";
import { globalConfigSchema } from "./globalConfig";
import { faqSchema } from "./faq";
import { contactSubmissionSchema } from "./contactSubmission";

export const schemaTypes = [
  locationSchema,
  menuItemSchema,
  employeePickSchema,
  eventSchema,
  taproomPhotoSchema,
  seasonalThemeSchema,
  globalConfigSchema,
  faqSchema,
  contactSubmissionSchema,
];
