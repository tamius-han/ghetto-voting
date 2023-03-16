import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import { GhettoBackend } from './ghetto-backend';
import fs from 'fs-extra';

export class Main {
  constructor() {
    const app = express();
    const port = 6969;

    const backend = new GhettoBackend();
    const jsonParser = bodyParser.json();

    app.use(fileUpload());
    app.use(cors());

    app.get('/ballot-count', (req, res) => {
      res.send(backend.getVoteCount());
    })

    app.get('/vote-start', (req, res) => {
      res.send({
        voteStart: +backend.voteStart,
        votesAllowed: backend.votesAllowed
      });
    });

    app.get('/last-public-vote', (req, res) => {
      res.send({
        lastPublicVoteTime: backend.lastPublicVoteTime
      })
    });

    app.get('/voter-id', (req, res) => {
      res.send({
        id: backend.generateVoterId(),
        voteStart: +backend.voteStart,
        votesAllowed: backend.votesAllowed
      });
    });

    app.get('/vote-config', (req, res) => {
      res.send(backend.getVotingConfig());
    })

    app.get('/contestants', (req, res) => {
      res.send(backend.getContestants());
    });

    app.get('/contestants/:id/image', (req, res) => {
      try {
        res.set('image/webp');
        res.send(fs.readFileSync(`data/images/${req.params.id}.webp`));
      } catch (e) {
        res.send({status: 404});
      }
    });
    app.get('/contestants/:id/image-full', (req, res) => {
      try {
        res.set('image/webp');
        res.send(fs.readFileSync(`data/images/${req.params.id}-full.webp`));
      } catch (e) {
        res.send({status: 404});
      }
    });


    app.post('/contestants/register', jsonParser, (req, res) => {
      console.log('↘↘ registering contestant!', req.body);

      res.send(backend.addContestant(req.body));
    });

    app.post('/contestants/:id', jsonParser, (req, res) => {
      console.log('↘↘ updating contestant', req.params.id, 'new stuff:', req.body);

      res.send(backend.updateContestant({...req.body, id: req.params.id}));
    });

    app.delete('/contestants/:id', jsonParser, (req, res) => {
      console.log('↘↘ updating contestant', req.params.id);

      res.send(backend.deleteContestant(+req.params.id));
    });

    app.post('/contestants/:id/image', async (req, res)=> {
      console.log('↘↘ updating image for contestant', req.params.id, ' — file:', req.files);

      if (!req.files) {
        return res.send({status: 400});
      }
      res.send(await backend.addContestantImage(+req.params.id, req.files.image ?? req.files.file));
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

    app.get('/jury-votes', (req, res) => {
      res.send(backend.getJuryVote());
    })

    app.post('/jury-votes', jsonParser, (req, res) => {
      res.send(backend.setJuryVote(req.body.votes));
    })

    app.post('/reset/voting', jsonParser, (req, res) => {
      if (req.headers.authorization === 'jakikaki') {
        res.send(backend.resetVoting());
      } else {
        res.send({status: 403});
      }
    });

    app.post('/reset/contestants', jsonParser, (req, res) => {
      if (req.headers.authorization === 'jakikaki') {
        res.send(backend.resetVoteCandidates());
      } else {
        res.send({status: 403});
      }
    });

    app.post('/start/voting', jsonParser, (req, res) => {
      if (req.headers.authorization === 'jakikaki') {
        res.send(backend.startVoting());
      } else {
        res.send({status: 403});
      }
    });

    app.post('/stop/voting', jsonParser, (req, res) => {
      if (req.headers.authorization === 'jakikaki') {
        res.send(backend.stopVoting());
      } else {
        res.send({status: 403});
      }
    });


    app.listen(port, () => {
      return console.log('haha voting machine go brrr');
    });

  }

}

const m = new Main();

