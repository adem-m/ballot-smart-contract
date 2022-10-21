import './App.css';
import {Toolbar} from "./components/toolbar/Toolbar";
import {VoteProposal} from "./components/vote-proposal/VoteProposal";
import {VoteList} from "./components/vote-list/VoteList";

const App = () => {
    return (
        <div className="App">
            <Toolbar/>
            <div className="app-body">
                <VoteProposal/>
                <VoteList/>
            </div>
        </div>
    );
}

export default App;
