export interface VoteCandidate {
  id: number,
  name: string,
  image?: string,
  imageUpdate?: number,
  votes?: number,
  juryVotes?: number,
  combinedVotes?: number,
}
