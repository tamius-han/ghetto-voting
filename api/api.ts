import express from 'express';
import { GhettoBackend } from './ghetto-backend';
import { VoteValidator } from './vote-validator';

export class Main {
  constructor() {
    const app = express();
    const port = 6969;

    const backend = new GhettoBackend();

    app.get('/voter-id', (req, res) => {
      res.send({
        id: backend.generateVoterId()
      });
    });

    app.get('/vote-config', (req, res) => {
      res.send(backend.getVotingConfig());
    })

    app.get('/my-votes', (req, res) => {
      res.send(backend.getPublicVote(req.headers.authorization || ''));
    });

    app.get('/public-votes', (req, res) => {
      res.send(
        {
          results: backend.getVotingResults()
        }
      );
    })

    app.post('/vote', (req, res) => {
      const r = backend.setPublicVote(
        req.headers.authorization || '',
        req.body.votes
      );
      res.send(r);
    });

    app.listen(port, () => {
      return console.log('haha voting machine go brrr');
    });
  }

}

const m = new Main();

