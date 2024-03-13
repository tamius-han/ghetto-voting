export interface Vote {
  candidateId: string,
  points: number,
}

export interface VoteRecord {
  voterId: string,
  votes: Vote[]
}
