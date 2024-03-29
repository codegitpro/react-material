/*eslint-enable*/
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { RouteComponentProps } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { withStyles, createStyles, Theme } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles/withStyles';
import removeMd from 'remove-markdown';
import CustomSnackbar, { ISnackbarProps } from 'components/shared/CustomSnackbar';
import CustomTableCell from 'components/shared/CustomTableCell';
import Ellipsis from 'components/Typography/Ellipsis';
import { UserProfile } from 'types/global';
import { deleteProposal, getProposals } from 'store/actions/sub-actions';
import { Proposals } from 'types/proposal';
import Axios from 'axios';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const styles = createStyles((theme: Theme) => ({
	root: {
		position: 'relative',
		marginTop: '-19px',
	},
	row: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.background.default,
		},
	},
	btnSubmitProposal: {
		marginBottom: 5,
		backgroundColor: theme.palette.primary.light,
		color: '#FFF',
		borderRadius: 0,
	},
	titleBtn: {
		color: '#4a148c',
		padding: '6px',
	},
	button: {
		padding: '6px',
	},
	busy: {
		position: 'absolute',
		left: 'calc(50% - 20px)',
		top: 'calc(50% - 20px)',
	},
}));

interface ISubmittedProViewProps extends RouteComponentProps {
	userProfile: UserProfile;
	classes: ClassNameMap<string>;
	proposals: Proposals;
	getProposals: (id: string, page: number, size: number, status: string) => Promise<void>;
	deleteProposal: (id: string) => Promise<void>;
}

interface ISubmittedProViewState extends ISnackbarProps {
	rowsPerPage: number;
	currentPage: number;
	isBusy: boolean;
	startDateOrder: "desc" | "asc";
	endDateOrder: "desc" | "asc";
	totalLength: number;
	submitData: [];
}
const CONT_API_PATH = process.env.REACT_APP_PROJECT_API + 'contractors/';

class SubmittedProView extends React.Component<ISubmittedProViewProps, ISubmittedProViewState> {

	constructor(props) {
		super(props);

		this.state = {
			submitData: [],
			rowsPerPage: 20,
			currentPage: 0,
			totalLength: 0,
			isBusy: false,
			showMessage: false,
			startDateOrder: "desc",
			endDateOrder: "desc",
			message: '',
			variant: 'success',
			handleClose: () => this.setState({ showMessage: false })

		};

	}
	componentDidMount() {
		const { userProfile } = this.props;
		Axios.get(`${CONT_API_PATH + userProfile.user_metadata.contractor_id}/proposals?page=${this.state.currentPage}&size=${this.state.rowsPerPage}&status=SUBMITTED`).then(res => {
			this.setState({ submitData: res.data.content })
			this.setState({ totalLength: res.data.totalElements })
		});
		// this.props.getProposals(userProfile.user_metadata.contractor_id,
		// 	0, 0, 'SUBMITTED');
	}

	handleChangePage = async (event, page) => {
		const { userProfile } = this.props;
		const { rowsPerPage } = this.state;
		try {
			if (page >= this.state.totalLength) page = this.state.totalLength - 1;
			Axios.get(`${CONT_API_PATH + userProfile.user_metadata.contractor_id}/proposals?page=${page}&size=${rowsPerPage}&status=SUBMITTED`)
				.then(data => {
					this.setState({
						submitData: data.data.content,
						isBusy: false,
						currentPage: page,
					});
				})
			this.setState({ isBusy: false });
		} catch (error) {
			console.log('CurrentProjectView.handleChangePage', error);
		}
		this.setState({ isBusy: false });
	};

	handleChangeRowsPerPage = event => {
		const { currentPage, rowsPerPage } = this.state;
		const curIndex = currentPage * rowsPerPage;
		const newPageSize = event.target.value;
		const newPage = Math.floor(curIndex / newPageSize);
		const { userProfile } = this.props;
		try {
			Axios.get(`${CONT_API_PATH + userProfile.user_metadata.contractor_id}/proposals?page=${currentPage}&size=${newPageSize}&status=SUBMITTED`).then(res => {
				this.setState({
					submitData: res.data.content,
					isBusy: false,
					currentPage: newPage,
					rowsPerPage: newPageSize,
				});
			});
		} catch (error) {
			console.log(error);
		}
	};

	handleDeleteProposal = async id => {
		this.setState({ isBusy: true });

		const { userProfile, proposals } = this.props;
		try {
			await this.props.deleteProposal(id);

			if (
				this.state.rowsPerPage * this.state.currentPage <
				proposals.totalElements - 1
			) {
				await this.props.getProposals(
					userProfile.user_metadata.contractor_id,
					this.state.currentPage,
					this.state.rowsPerPage,
					'SUBMITTED'
				);
				this.setState({
					isBusy: false,
					showMessage: true,
					message: 'delete proposal success',
					variant: 'success',
				});
			} else {
				const currentPage = this.state.currentPage - 1;
				await this.props.getProposals(
					userProfile.user_metadata.contractor_id,
					currentPage,
					this.state.rowsPerPage,
					'SUBMITTED'
				);

				this.setState({
					isBusy: false,
					showMessage: true,
					message: 'delete proposal success',
					variant: 'success',
					currentPage,
				});
			}
		} catch (error) {
			console.log(error);
			this.setState({
				isBusy: false,
				showMessage: true,
				message: 'delete proposal failed',
				variant: 'error',
			});
		}
	};

	handleSelectProposal = id => {
		this.props.history.push(`/s_cont/proposal_detail/${id}`);
	};
	StartDateToggleSort = () => {
		let startDateOrder: ('desc' | 'asc') = 'desc';

		if (this.state.startDateOrder === 'desc') {
			startDateOrder = 'asc';
		}
		this.state.submitData.sort((a: any, b: any) =>
			a.project.startDate > b.project.startDate ? 1 : -1
		);
		this.setState({ startDateOrder });
	}

	EndDateToggleSort = () => {
		let endDateOrder: ('desc' | 'asc') = 'desc';

		if (this.state.endDateOrder === 'desc') {
			endDateOrder = 'asc';
		}
		this.state.submitData.sort((a: any, b: any) =>
			a.project.endDate > b.project.endDate ? 1 : -1
		);
		this.setState({ endDateOrder });
	}

	render() {
		const { classes } = this.props;

        if (this.state.submitData.length === 0) {
            return <CircularProgress className={classes.waitingSpin} />;
        }
		return (
			<Box className={classes.root}>
				<Table className={classes.table} style={{marginTop:'75px'}}>
					<TableHead>
						<TableRow>
							<CustomTableCell className="sub-table-col-1"> Project Title </CustomTableCell>
							<CustomTableCell align="center">Bids</CustomTableCell>
							<CustomTableCell align="center">Location</CustomTableCell>
							<CustomTableCell align="center">Price</CustomTableCell>
							<CustomTableCell align="center">
								<TableSortLabel style={{ fontSize: '15px', cursor: "pointer" }} className="Arrowdown "
									active={true}
									direction={this.state.startDateOrder}
									onClick={this.StartDateToggleSort}
								>
									Upload Date  </TableSortLabel>
							</CustomTableCell>
							<CustomTableCell align="center"><TableSortLabel style={{ fontSize: '15px', cursor: "pointer" }} className="Arrowdown"
								active={true}
								direction={this.state.endDateOrder}
								onClick={this.EndDateToggleSort}
							>
								Bids Due  </TableSortLabel>
							</CustomTableCell>
							<CustomTableCell align="center" className="sub-table-col-width">Project Details</CustomTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.state.submitData.map((row: any) => (
							<TableRow className={classes.row} key={row.id} hover onClick={() => this.handleSelectProposal(row.id)}>
								<CustomTableCell
									component="th"
									scope="row"
									align="center"
								>
									<Ellipsis maxLines={2}>{row.project.title}</Ellipsis>
								</CustomTableCell>
								<CustomTableCell
									component="th"
									scope="row"
									align="center"
								>
									{row.project.budget}
								</CustomTableCell>

								<CustomTableCell
									component="th"
									scope="row"
									align="center"
								>
									{row.project.city}
								</CustomTableCell>
								<CustomTableCell
									component="th"
									scope="row"
									align="center"
								>
									${row.budget}
								</CustomTableCell>
								<CustomTableCell
									align="center"
								>
									{row.project.startDate && row.project.startDate.slice(0, 10)}
									<div className="time">
										{row.project.startDate && row.project.startDate.slice(10, 19)}&nbsp;{row.project.startDate.slice(10, 13) <= 11 ? "AM" : "PM"}
									</div>
								</CustomTableCell>
								<CustomTableCell align="center"
								>
									<Ellipsis maxLines={2}>{removeMd(row.project.endDate && row.project.endDate.slice(0, 10))}
										<div className="time">
											{row.project.endDate && row.project.endDate.slice(10, 19)}&nbsp;{row.project.endDate.slice(10, 13) <= 11 ? "AM" : "PM"}
										</div>
									</Ellipsis>
								</CustomTableCell>
								<CustomTableCell align="center"
								>
									{row.project.description}
								</CustomTableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<TablePagination
					style={{ overflow: 'auto' }}
					rowsPerPageOptions={[5, 10, 20]}
					component="div"
					count={this.state.totalLength}
					rowsPerPage={this.state.rowsPerPage}
					page={this.state.currentPage}
					backIconButtonProps={{ 'aria-label': 'Previous Page' }}
					nextIconButtonProps={{ 'aria-label': 'Next Page' }}
					onChangePage={this.handleChangePage}
					onChangeRowsPerPage={this.handleChangeRowsPerPage}
				/>
				<CustomSnackbar
					open={this.state.showMessage}
					variant={this.state.variant}
					message={this.state.message}
					handleClose={this.state.handleClose}
				/>
				{this.state.isBusy && <CircularProgress className={classes.busy} />}
			</Box>
		);
	}
}

const mapDispatchToProps = {
	getProposals,
	deleteProposal,
};

const mapStateToProps = state => ({
	proposals: state.sub_data.proposals,
	userProfile: state.global_data.userProfile,
});

export default compose(
	withStyles(styles),
	connect(mapStateToProps, mapDispatchToProps)
)(SubmittedProView);
