export interface VoteCandidate {
  id: string,
  name: string,
  image?: string,
  votes?: number,
  juryVotes?: number,
  combinedVotes?: number,
}
