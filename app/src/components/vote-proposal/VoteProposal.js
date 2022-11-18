import Paper from '@mui/material/Paper';
import {Button, TextField} from "@mui/material";
import {useState} from "react";

import './VoteProposal.css';

export const VoteProposal = () => {
    const [proposal, setProposal] = useState('');

    const onSubmit = () => {
        console.log("proposal: " + proposal);
    }

    return (
        <Paper className="paper" elevation={3}>
            <div className="block-label">Proposer un vote</div>
            <div className="vote-proposal-action-block">
                <TextField id="vote-proposal-input" label="Votre proposition" variant="outlined"
                           onChange={e => setProposal(e.target.value)}/>
                <Button variant="contained" color="success"
                        onClick={onSubmit}>
                    Proposer
                </Button>
            </div>
        </Paper>
    );
};