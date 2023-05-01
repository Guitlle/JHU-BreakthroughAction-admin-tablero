from dask.distributed import LocalCluster


if __name__=='__main__':

    local = LocalCluster()
    print(local.get_logs())

    while True:
        input_str = input('Q to quit')
        if input_str == 'Q':
            local.close()
            exit()
