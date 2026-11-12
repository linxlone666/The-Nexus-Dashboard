export const sections = [
  {
    id: "activity",
    label: "Activity",
    rows: [
      ["Loading dock", "Door held open · 09:42"],
      ["Main entrance", "Access granted · 09:38"],
    ],
  },
  {
    id: "cctv",
    label: "CCTV",
    rows: [
      ["Lobby camera", "Online"],
      ["Loading dock camera", "Online"],
    ],
  },
  {
    id: "alarms",
    label: "Alarms",
    rows: [
      ["Loading dock", "Open"],
      ["West stairwell", "Acknowledged"],
    ],
  },
  {
    id: "access",
    label: "Access",
    rows: [
      ["Main entrance", "Open to staff"],
      ["Server room", "Restricted"],
    ],
  },
  {
    id: "parking",
    label: "Parking",
    rows: [
      ["North garage", "38 spaces available"],
      ["Visitor lot", "26 spaces available"],
    ],
  },
  {
    id: "my-views",
    label: "My views",
    rows: [
      ["Control room", "Current view"],
      ["Site security", "Sample view"],
    ],
  },
] as const;

export const dashboardMetrics = [
  ["Active alarms", "03"],
  ["People on site", "1,284"],
  ["Parking available", "64"],
] as const;
