import express from 'express';
import cors from 'cors';
import { GhettoBackend } from './ghetto-backend';
import fs from 'fs-extra';

export class Main {
  constructor() {
    const app = express();
    const port = 6969;

    const backend = new GhettoBackend();

    app.use(cors());


    app.get('/voter-id', (req, res) => {
      res.send({
        id: backend.generateVoterId()
      });
    });

    app.get('/vote-config', (req, res) => {
      res.send(backend.getVotingConfig());
    })

    app.get('/contestants', (req, res) => {
      res.send(backend.getContestants());
    });
    app.get('/contestant/image/:filename', (req, res) => {
      console.log('got contestant!');
      console.log('current dir:', process.cwd())
      console.log('exists data/images:', fs.readdirSync('./'))
      res.set('image/webp');
      res.send(fs.readFileSync(`data/images/${req.params.filename}`));
    });

    app.get('/my-votes', (req, res) => {
      res.send(backend.getPublicVote(req.headers.authorization || ''));
    });

    app.get('/public-votes', (req, res) => {
      res.send(
        {
          results: backend.getVotingResults()
        }
      );
    });

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

