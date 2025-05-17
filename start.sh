cd frontend
screen -dmS frontend bash -c 'npm run dev'

cd ../backend
cd src
screen -dmS backend bash -c 'make dev'


echo "Frontend and backend started"
