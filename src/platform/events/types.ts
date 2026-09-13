export type VeyraEventMap = {
  "creator.created": {
    creatorId: string;
    ownerUserId: string;
  };
  "project.published": {
    creatorId: string;
    projectId: string;
  };
  "comment.created": {
    creatorId: string;
    projectId: string;
    commentId: string;
  };
  "verification.approved": {
    creatorId: string;
    verificationType: string;
  };
  "ticket.created": {
    ticketId: string;
    creatorId?: string;
  };
  "subscription.updated": {
    creatorId: string;
    subscriptionId: string;
  };
  "consent.changed": {
    purpose: string;
    choice: string;
    policyVersion: string;
  };
};

export type VeyraEventName = keyof VeyraEventMap;

export type VeyraEvent<TName extends VeyraEventName = VeyraEventName> = {
  id: string;
  name: TName;
  occurredAt: string;
  actorUserId?: string;
  payload: VeyraEventMap[TName];
};
