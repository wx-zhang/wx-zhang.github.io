# Remove everything in /Users/slimhy/Documents/Website/habibslim.github.io/
rm -rf /Users/slimhy/Documents/Website/habibslim.github.io/*
# Copy all the contents of ./_size folder to /Users/slimhy/Documents/Website/habibslim.github.io/
cp -r ./_site/* /Users/slimhy/Documents/Website/habibslim.github.io/

cd /Users/slimhy/Documents/Website/habibslim.github.io/
git add .
git commit -m "Updated HTML."
git push origin main
cd -
