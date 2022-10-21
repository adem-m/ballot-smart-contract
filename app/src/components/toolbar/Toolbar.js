import './Toolbar.css';
import AppLogo from '../../logo.svg';

export const Toolbar = () => {
    return (
        <div className="toolbar">
            <img className="app-logo" src={AppLogo} alt={"Block vote logo"}/>
            <div className="app-title">Block Vote</div>
        </div>
    );
};