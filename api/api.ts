import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GhettoBackend } from './ghetto-backend';
import fs from 'fs-extra';

export class Main {
  constructor() {
    const app = express();
    const port = 6969;

    const backend = new GhettoBackend();
    const jsonParser = bodyParser.json();

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
      try {
        res.set('image/webp');
        res.send(fs.readFileSync(`data/images/${req.params.filename}`));
      } catch (e) {
        res.send({status: 404});
      }
    });

    app.post('/contestant/:id/image', jsonParser, (req, res) => {
      console.log(
        "Trying to set image for contestant:",
        req.params.id,
        "; img:",
        req.body.image
      );
      console.log('body?', req.body);
      const r = backend.registerCandidateImage(req.params.id, req.body.image);
      res.send({
        result: r
      });
    });

    app.get('/my-votes', (req, res) => {
      res.send(backend.getPublicVote(req.headers.authorization || '') || []);
    });

    app.get('/results', (req, res) => {
      res.send(backend.getVotingResults());
    });

    app.post('/vote', jsonParser, (req, res) => {
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

