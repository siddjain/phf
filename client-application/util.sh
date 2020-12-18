function checkForNull {
	if [ $# -ne 1 ]; then
      echo "Usage: checkForNull <variable-name>"
      exit 1
    fi
    local name=$1
    # get the value of variable whose name is in name
    # https://stackoverflow.com/a/1921337/147530
    local value=${!name}
    : "${value:? $name is not set}"
}

function directoryShouldNotExist {
  if [ -d $1 ]; then
    echo "A directory name $1 already exists"
    exit 1
  fi
}

function directoryShouldExist {
  if [ ! -d $1 ]; then
    echo "directory $1 does not exist"
    exit 1    
  fi
}

function fileShouldExist {
   if [ ! -f $1 ]; then
     echo "file $1 does not exist"
   fi 
}