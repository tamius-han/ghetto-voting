export interface VoteCandidate {
  id: number,
  name: string,
  image?: string,
  votes?: number,
  juryVotes?: number,
  combinedVotes?: number,
}
