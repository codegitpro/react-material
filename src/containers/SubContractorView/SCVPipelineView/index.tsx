import React from 'react';
import { Redirect, Switch, RouteComponentProps } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import CustomTabs from "components/shared/CustomTabs";
import SecuredRoute from 'routers/SecuredRoute';
import InvitedProView from './InvitedProView';
import SubmittedProView from './SubmittedProView';
import WonProView from './WonProView';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

const styles = createStyles((theme: Theme) => ({
    root: {
        flexGrow: 1,
    }
}));

interface ISCVPipelineViewProps extends RouteComponentProps {
    classes: ClassNameMap<string>;
}

class SCVPipelineView extends React.Component<ISCVPipelineViewProps> {
    render() {
        const { match, location } = this.props;
        const tabPaths = [
            `${match.url}/submitted`,
            `${match.url}/invited`,
            `${match.url}/awarded`
        ]
        let tab = tabPaths.indexOf(location.pathname);
        if (tab < 0) tab = 0
        return (
            <Box className="" style={{width:'100%',marginTop:'60px' ,overflow:'auto',height:'calc((106vh - 64px) - 56px)' }}>
                <div className="sub-header-tab" style={{ justifyContent: 'space-between', display: 'flex', padding: '17px 30px' ,paddingBottom:'17px',position:'fixed',width:'100%',zIndex:10 , backgroundColor:'white' , paddingRight:'60px', marginTop: -15 }}>
                    <CustomTabs
                        init={tab}
                        tabs={[
                            {
                                href: tabPaths[0],
                                label: 'Submitted',
                            },
                            {
                                href: tabPaths[1],
                                label: 'Awarded',
                            },
                            {
                                href: tabPaths[2],
                                label: 'Completed',
                            }
                        ]}
                    />
                    <TextField
                        id="outlined-start-adornment"
                        placeholder="Search"
                        className="gensearch"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon className="searchicon" /></InputAdornment>,
                        }}
                        variant="outlined"
                    />
                </div>
                <Switch>
                    <SecuredRoute
                        path={tabPaths[0]}
                        component={SubmittedProView}
                    />
                    <SecuredRoute
                        path={tabPaths[1]}
                        component={InvitedProView}
                    />
                    <SecuredRoute
                        path={tabPaths[2]}
                        component={WonProView}
                    />
                    <Redirect path={`${match.url}`} to={tabPaths[0]} />
                </Switch>
            </Box>
        );
    }
}

export default withStyles(styles)(SCVPipelineView);
