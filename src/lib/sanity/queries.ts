import { groq } from "next-sanity";

export const globalConfigQuery = groq`
  *[_type == "globalConfig"][0] {
    siteName,
    quotes[] { quote, author, weight, pinFirst },
    returningVisitorQuotes[] { quote, author },
    footerMessages[] { text },
    globalBanner { text, isActive, linkUrl },
    mailchimpListId
  }
`;

export const activeSeasonalThemeQuery = groq`
  *[_type == "seasonalTheme" && isActive == true][0] {
    name,
    badgeText,
    bannerMessage,
    heroImages[],
    logoOverride,
    accentPalette,
    startDate,
    endDate,
    isActive
  }
`;

export const locationsQuery = groq`
  *[_type == "location"] | order(name asc) {
    _id,
    name,
    slug,
    address,
    phone,
    googleMapsUrl,
    orderOnlineUrl,
    heroImage,
    tagline,
    hours[] { day, open, close, isClosed },
    sundayHours { open, close, isClosed },
    holidayOverrides[] { date, label, hoursNote },
    visitFAQs[] { question, answer },
    privateEvents { isActive, headline, description, highlights[] { text }, photo }
  }
`;

export const locationBySlugQuery = groq`
  *[_type == "location" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    address,
    phone,
    googleMapsUrl,
    orderOnlineUrl,
    heroImage,
    tagline,
    hours[] { day, open, close, isClosed },
    sundayHours { open, close, isClosed },
    holidayOverrides[] { date, label, hoursNote },
    visitFAQs[] { question, answer },
    privateEvents { isActive, headline, description, highlights[] { text }, photo }
  }
`;

export const employeePicksQuery = groq`
  *[_type == "employeePick" && isActive == true && location._ref == $locationId] {
    _id,
    employeeName,
    staffBio,
    pickType,
    itemName,
    message
  }
`;

export const upcomingEventsQuery = groq`
  *[_type == "event" && isActive == true && date >= $now] | order(date asc) [$start...$end] {
    _id,
    title,
    date,
    time,
    location-> { name, slug },
    description,
    isRecurring,
    recurrenceNote,
    requiresTicket,
    ticketUrl
  }
`;

export const upcomingEventsByLocationQuery = groq`
  *[_type == "event" && isActive == true && date >= $now && location._ref == $locationId] | order(date asc) [0...3] {
    _id,
    title,
    date,
    time,
    description,
    isRecurring,
    recurrenceNote,
    requiresTicket,
    ticketUrl
  }
`;

export const approvedTaproomPhotosQuery = groq`
  *[_type == "taproomPhoto" && approvalStatus == "approved"] | order(featured desc, _createdAt desc) [0...20] {
    _id,
    image,
    caption,
    location-> { name, slug },
    featured
  }
`;

export const approvedPhotosByLocationQuery = groq`
  *[_type == "taproomPhoto" && approvalStatus == "approved" && location._ref == $locationId] | order(featured desc, _createdAt desc) [0...20] {
    _id,
    image,
    caption,
    featured
  }
`;

export const faqsByCategoryQuery = groq`
  *[_type == "faq" && category in $categories] | order(category asc) {
    _id,
    question,
    answer,
    category,
    location-> { name, slug }
  }
`;

export const menuItemsByLocationQuery = groq`
  *[_type == "menuItem" && isActive == true && location._ref == $locationId && menuType == $menuType] | order(displayOrder asc, section asc) {
    _id,
    name,
    description,
    price,
    menuType,
    section,
    tags,
    isFanFavorite,
    isStaffPick,
    displayOrder
  }
`;
