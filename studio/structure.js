// Left menu of the panel, in French.
export const structure = (S) =>
  S.list()
    .title("Contenu")
    .items([
      S.listItem()
        .title("Articles")
        .schemaType("post")
        .child(S.documentTypeList("post").title("Articles").defaultOrdering([{ field: "publishedAt", direction: "desc" }])),
      S.listItem()
        .title("Événements")
        .schemaType("event")
        .child(S.documentTypeList("event").title("Événements").defaultOrdering([{ field: "date", direction: "desc" }])),
      S.listItem()
        .title("Témoignages")
        .schemaType("testimonial")
        .child(S.documentTypeList("testimonial").title("Témoignages")),
      S.listItem()
        .title("Équipe")
        .schemaType("teamMember")
        .child(S.documentTypeList("teamMember").title("Équipe").defaultOrdering([{ field: "order", direction: "asc" }])),
    ]);
