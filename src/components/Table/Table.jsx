import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import EnhancedTableToolbar from "./EnhancedTableToolbar";
import EnhancedTableHead from "./EnhancedTableHead";
import DialogFull from "components/DialogFull";
import FormUpdate from "./components/FormUpdate/FormUpdate";
import FormInput from "./components/FormInput/FormInput";
import DialogBasic from "components/DialogBasic";
import Grid from "@material-ui/core/Grid";

import AlertContext from "context/AlertContext";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
  cell: {
    borderRight: "1px solid #eeeeee",
  },
  editIcon: {
    color: "#2979ff",
  },
}));

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function TableView(props) {
  const classes = useStyles();

  const data = React.useContext(props.context);
  const service = props.service;
  const lowercasedFilter = data.query.toLowerCase();
  let filteredData = data.state.filter((value) => {
    return (
      value.kode_bank.toLowerCase().includes(lowercasedFilter) ||
      value.nama_bank.toLowerCase().includes(lowercasedFilter) ||
      value.alamat_instansi.toLowerCase().includes(lowercasedFilter) ||
      value.email.toLowerCase().includes(lowercasedFilter)
    );
  });

  const alertContext = React.useContext(AlertContext);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("kode_produk");
  const [page, setPage] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [openDelete, setOpenDelete] = React.useState({
    open: false,
    id: "",
    kode: "",
  });
  const [openUpdate, setOpenUpdate] = React.useState({
    open: false,
    master: {},
  });
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, data.state.length - page * rowsPerPage);

  const insertUser = () => {
    setOpen(true);
  };
  const closeDialog = () => {
    setOpen(false);
  };
  const closeUpdate = () => {
    setOpenUpdate({
      ...openUpdate,
      open: false,
    });
  };

  const deleteUser = async () => {
    try {
      alertContext.updateState(true, false, "info", "");
      await service.deleteData(openDelete.id);
      setOpenDelete({
        open: false,
        id: "",
        username: "",
      });
      alertContext.updateState(
        false,
        true,
        "success",
        "Menghapus master berhasil."
      );
      data.updateState();
    } catch (error) {
      setOpenDelete({
        open: false,
        id: "",
        username: "",
      });
      alertContext.updateState(false, true, "error", "Menghapus master gagal!");
      console.log(error);
    }
  };

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          addClick={insertUser}
          refresh={() => {
            data.updateState();
          }}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(filteredData, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((produks, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover tabIndex={-1} key={produks.id}>
                      <TableCell className={classes.cell}>
                        <ButtonGroup size="small">
                          <Button
                            onClick={() => {
                              setOpenUpdate({
                                open: true,
                                data: produks,
                              });
                            }}
                          >
                            <EditIcon className={classes.editIcon} />
                          </Button>
                          <Button
                            onClick={() => {
                              setOpenDelete({
                                open: true,
                                id: produks.id,
                                kode: produks.kode_asuransi,
                              });
                            }}
                          >
                            <DeleteIcon color="error" />
                          </Button>
                        </ButtonGroup>
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        align="left"
                        className={classes.cell}
                      >
                        {produks.kode_bank}
                      </TableCell>
                      <TableCell align="left" className={classes.cell}>
                        {produks.nama_bank
                          ? produks.nama_bank
                          : produks.nama_instansi}
                      </TableCell>
                      <TableCell align="left" className={classes.cell}>
                        {produks.alamat_instansi}
                      </TableCell>
                      <TableCell align="left" className={classes.alamat}>
                        {produks.email}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 33 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.state.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <DialogFull open={open} close={closeDialog} title="Form Input">
        <Grid container>
          <Grid item xl={3} lg={3} md={3}></Grid>
          <Grid item xl={6} lg={6} md={6} xs={12}>
            <FormInput />
          </Grid>
          <Grid item xl={3} lg={3} md={3}></Grid>
        </Grid>
      </DialogFull>
      <DialogFull open={openUpdate.open} close={closeUpdate}>
        <Grid container>
          <Grid item xl={3} lg={3} md={3}></Grid>
          <Grid item xl={6} lg={6} md={6} xs={12}>
            <FormUpdate master={openUpdate.data} />
          </Grid>
          <Grid item xl={3} lg={3} md={3}></Grid>
        </Grid>
      </DialogFull>

      <DialogBasic
        id="delete"
        open={openDelete.open}
        close={() => {
          setOpenDelete({
            open: false,
            id: "",
            kode: "",
          });
        }}
        action={deleteUser}
        title="Menghapus User"
      >
        Anda yakin menghapus prodek dengan kode asuransi "{openDelete.kode}"
      </DialogBasic>
    </div>
  );
}

export default TableView;
