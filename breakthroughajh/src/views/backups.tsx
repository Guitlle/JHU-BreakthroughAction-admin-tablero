// @ts-nocheck
import { useState, useEffect, Suspense } from "react";

import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { getStorage, getDownloadURL, ref, list, deleteObject } from "firebase/storage";


function BackupsView(props) {
    const storage = getStorage();
    const filesRef = ref(storage, 'db/backups')
    var [page, setPage] = useState({"items": []});
    var npage = 1;

    function loadData() {
        list(filesRef, { maxResults: 100 }).then((value) => {
          console.log(value);
          setPage(value);
        });
    }
    useEffect( () => {
        loadData()
    }, []);

    function handleNextPage() {
      list(filesRef, { maxResults: 100 }).then((value) => {
        npage += 1;
        setPage(value);
      });
    }

    function handlePrevPage() {
      list(filesRef, { maxResults: 100 }).then((value) => {
        npage -= 1;
        setPage(value);
      });
    }

    async function handleDownloadItem(path) {
        let downloadLink = await getDownloadURL(ref(storage, path));
        window.open(downloadLink);
    }

    async function handleDeleteItem(item) {
        if (confirm("Eliminar archivo " + item.name + " ?"))
            deleteObject(ref(storage, item.fullPath)).then(loadData);
    }

    return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <h2 style={{margin: "1em"}}>Backups</h2>
      <Suspense fallback={<h2>Loading...</h2>}>
        <TableContainer sx={{}}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left">
                  Archivo
                </TableCell>
                <TableCell align="left">
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {page.items
                .map((item, key) => {
                  return (
                    <TableRow hover tabIndex={-1} key={key}>
                      <TableCell align="left">
                        <div style={{cursor: "pointer"}} onClick={handleDownloadItem.bind(null, item.fullPath)}>{item.name}</div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outlined" color="error" onClick={handleDeleteItem.bind(null, item)}>Eliminar Backup</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        {(npage > 1? <button onClick={handlePrevPage}>Previous Page</button>: <></>)}
        {(page.nextPageToken ? <button onClick={handleNextPage}>Next Page</button>: <></>)}
      </Suspense>
    </Box>
  );
}

export default BackupsView;
