# Node http server 
A Node.js HTTP server that allows clients to view log files (which may be terabytes long, and continuously growing) generated by some application(s).

## To run
``` 
node server.js
```

## Request format
localhost:8000/logs?startDate=date1&startTime=time1&endDate=date2&endTime=time2

All parameters - date1, time1, date2, time2 are strings.  
Date format : YYYY-MM-DD  
Time format : HH:MM:SS

Example- 
localhost:8000/logs?startDate=2020-01-01&startTime=00:08:00&endDate=2020-01-02&endTime=00:08:00

## With regards to assignment
### what works
1. Leverages ascending order of timestamps to binary search queries.
2. Minimal memory consumption as no file is loaded into memory
3. Proper error messages on bad/invalid requests.
4. Uses no npm modules

### what doesn't work
1. Ability to move forward or backward from a previous result without doing a new request.




