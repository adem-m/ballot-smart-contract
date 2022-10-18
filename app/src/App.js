import logo from './logo.svg';
import './App.css';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import {Button, Grid, List, ListItem, Rating, styled, TextField, Toolbar, Typography} from "@mui/material";
import Vote from "./Vote";

function App() {
    const mockedData = [
        "Aimez-vous les pieds?",
        "Sentez-vous des pieds?",
        "Prout?"
    ];

    return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Box
                        component="img"
                        sx={{
                            height: 64,
                        }}
                        alt="logo"
                        src={logo}
                    />
                    <Typography variant="h3" component="div" >
                        BlockVote
                    </Typography>
                </Toolbar>
            </AppBar>
      </Box>

      <Box ml={80}>
          <h1>Proposer un vote </h1>
          <TextField id="proposition" label="Votre proposition" variant="outlined" />
          <Button variant="contained" color="success" onClick={() => console.log("Appeler la fonction proposition")}>
              Proposer
          </Button>
      </Box>
        { mockedData.length !== 0 &&
            <Grid item xs={8}>
                {mockedData.map((data) => {
                    return (
                        <Vote question={data}/>
                    );
                })}
            </Grid>
        }
    </div>
  );
}

export default App;
